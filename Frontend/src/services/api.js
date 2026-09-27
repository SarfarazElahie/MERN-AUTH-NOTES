import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

/* ─────────────────────────────────────────────
   Token bridge
   Interceptor needs access to the current token
   and a way to update it. AuthContext will
   register these on mount.
───────────────────────────────────────────── */

let getToken = () => null;       // returns current access token
let setToken = () => {};         // updates access token in context
let onAuthFailure = () => {};    // called when refresh itself fails → logout

export const registerAuthHandlers = ({ get, set, onFail }) => {
  getToken = get;
  setToken = set;
  onAuthFailure = onFail;
};

/* ─────────────────────────────────────────────
   Request interceptor
   Attach Authorization header automatically
───────────────────────────────────────────── */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ─────────────────────────────────────────────
   Response interceptor
   On 401 → refresh → retry once
───────────────────────────────────────────── */

let isRefreshing = false;                 // prevent parallel refresh storms
let pendingQueue = [];                    // requests waiting for refresh

const flushQueue = (error, newToken = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only handle 401, and only retry once per request
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't retry the refresh endpoint itself
    if (original.url?.includes("/auth/refresh")) {
      onAuthFailure();
      return Promise.reject(error);
    }

    // If a refresh is already in progress → queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await api.post("/auth/refresh");
      const newToken = refreshRes.data.accessToken;

      setToken(newToken);
      flushQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      flushQueue(refreshErr);
      onAuthFailure();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
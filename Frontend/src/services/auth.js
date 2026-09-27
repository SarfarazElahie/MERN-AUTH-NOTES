import api from "./api";

const bearer = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const registerUser = (data) => api.post("/auth/register", data);

export const loginUser = (data) => api.post("/auth/login", data);

export const logoutUser = () => api.post("/auth/logout");

export const logoutAllUser = (token) =>
  api.post("/auth/logout-all", {}, bearer(token));

export const refreshAccessToken = () => api.post("/auth/refresh");

export const getMe = (token) => api.get("/auth/me", bearer(token));
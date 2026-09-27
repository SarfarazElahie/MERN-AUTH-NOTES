import { createContext, useContext, useEffect, useState } from "react";
import api, { registerAuthHandlers } from "../services/api";
import * as authService from "../services/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔗 Wire interceptor → context
  useEffect(() => {
    registerAuthHandlers({
      get: () => accessToken,
      set: (t) => setAccessToken(t),
      onFail: () => {
        setUser(null);
        setAccessToken(null);
      },
    });
  }, [accessToken]);

  // 🔄 Initial silent login (uses refresh cookie)
  useEffect(() => {
    const init = async () => {
      try {
        const refreshRes = await api.post("/auth/refresh");
        const token = refreshRes.data.accessToken;
        setAccessToken(token);

        const meRes = await api.get("/auth/me");
        setUser(meRes.data.user);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const register = async (name, email, password) => {
    const res = await authService.registerUser({ name, email, password });
    return res.data;
  };

  const login = async (email, password) => {
    const res = await authService.loginUser({ email, password });
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const logoutAll = async () => {
    try {
      await api.post("/auth/logout-all");
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const refresh = async () => {
    try {
      const res = await authService.refreshAccessToken();
      setAccessToken(res.data.accessToken);
      return res.data.accessToken;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  };

  const getMe = async () => {
    const res = await api.get("/auth/me");
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        register,
        login,
        logout,
        logoutAll,
        refresh,
        getMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
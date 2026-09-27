import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load → try silent login using the refresh cookie
  useEffect(() => {
    const init = async () => {
      try {
        const refreshRes = await authService.refreshAccessToken();
        const token = refreshRes.data.accessToken;

        const meRes = await authService.getMe(token);
        setUser(meRes.data.user);
        setAccessToken(token);
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
      await authService.logoutAllUser(accessToken);
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
    const res = await authService.getMe(accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * Runs an authenticated API call.
   * If it returns 401, tries /refresh once and retries.
   */
  const secureRequest = async (apiFn) => {
    try {
      return await apiFn(accessToken);
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refresh();
        if (newToken) return apiFn(newToken);
      }
      throw err;
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    register,
    login,
    logout,
    logoutAll,
    refresh,
    getMe,
    secureRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
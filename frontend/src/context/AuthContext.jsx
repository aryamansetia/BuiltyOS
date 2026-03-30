import { createContext, useContext, useEffect, useMemo, useState } from "react";

import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

const TOKEN_KEY = "builtyos_token";
const USER_KEY = "builtyos_user";

const getStoredSession = () => {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const storedToken = localStorage.getItem(TOKEN_KEY);
  const rawStoredUser = localStorage.getItem(USER_KEY);

  if (!rawStoredUser) {
    return { token: storedToken, user: null };
  }

  try {
    return {
      token: storedToken,
      user: JSON.parse(rawStoredUser)
    };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { token: null, user: null };
  }
};

const INITIAL_SESSION = getStoredSession();

const setAuthHeader = (token) => {
  if (token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(INITIAL_SESSION.token);
  const [user, setUser] = useState(INITIAL_SESSION.user);

  useEffect(() => {
    setAuthHeader(token);
  }, [token]);

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const login = async (payload) => {
    const { data } = await axiosClient.post("/auth/login", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await axiosClient.post("/auth/register", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

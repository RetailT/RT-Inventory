// AuthContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const isTokenExpired = (userData) => {
  try {
    const token = userData?.token;
    if (!token) return true;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ims_user"); // ← sessionStorage
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isTokenExpired(parsed)) {
          sessionStorage.removeItem("ims_user");
          setUser(null);
        } else {
          setUser(parsed);
        }
      }
    } catch {
      sessionStorage.removeItem("ims_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password,
      });
      const userData = res.data;
      setUser(userData);
      sessionStorage.setItem("ims_user", JSON.stringify(userData)); // ← sessionStorage
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("ims_user"); // ← sessionStorage
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
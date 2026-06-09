import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const IDLE_TIMEOUT_MS   = 60 * 60 * 1000; // 1 hour
const WARNING_BEFORE_MS = 60 * 1000;       // warn 1 min before logout

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
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // ── Idle timer refs ──────────────────────────────────────────
  const idleTimerRef    = useRef(null);
  const warningTimerRef = useRef(null);
  const throttleRef     = useRef(null);
  const userRef         = useRef(user); // always up-to-date user inside event handlers

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ── Restore session on mount ─────────────────────────────────
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ims_user");
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

  // ── logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const stored = sessionStorage.getItem("ims_user");
      const token  = stored ? JSON.parse(stored)?.token : null;
      if (token) {
        await axios.post(
          `${API_BASE}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // Silently ignore — still clear local session below
    } finally {
      setUser(null);
      setShowIdleWarning(false);
      sessionStorage.removeItem("ims_user");
    }
  }, []);

  // ── Idle timer logic ─────────────────────────────────────────
  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current)    clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (!userRef.current) return; // don't run timer when logged out

    clearIdleTimers();
    setShowIdleWarning(false);

    // Warning: fires (IDLE_TIMEOUT_MS - WARNING_BEFORE_MS) after last activity
    warningTimerRef.current = setTimeout(() => {
      if (userRef.current) setShowIdleWarning(true);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Auto-logout: fires after full IDLE_TIMEOUT_MS
    idleTimerRef.current = setTimeout(() => {
      if (userRef.current) {
        console.log("⏱️ Auto-logout: idle timeout reached");
        logout();
      }
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimers, logout]);

  // ── Attach / detach activity listeners ──────────────────────
  useEffect(() => {
    if (!user) {
      // User logged out — clear everything
      clearIdleTimers();
      setShowIdleWarning(false);
      return;
    }

    const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel", "click"];

    const handleActivity = () => {
      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
        resetIdleTimer();
      }, 500);
    };

    EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    resetIdleTimer(); // start timer on login

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
      clearIdleTimers();
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [user, resetIdleTimer, clearIdleTimers]);

  // ── login ────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res      = await axios.post(`${API_BASE}/auth/login`, { username, password });
      const userData = res.data;
      setUser(userData);
      sessionStorage.setItem("ims_user", JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        clearError,
        showIdleWarning,
        setShowIdleWarning,
        resetIdleTimer,   // expose so "Stay Logged In" button can reset timer
      }}
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
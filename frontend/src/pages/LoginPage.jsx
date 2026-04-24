import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiLoader,
  FiSun,
  FiMoon,
} from "react-icons/fi";

const LoginPage = () => {
  const { login, loading, error, clearError, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e) => {
    clearError();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;
    const result = await login(form.username, form.password);
    if (result.success) navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden theme-bg"
      style={{ transition: "background-color 0.3s ease" }}
    >
      {/* Theme toggle - top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          color: "var(--text-muted)",
          boxShadow: "var(--shadow-card)",
        }}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
      </button>

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#FF6B00 1px, transparent 1px), linear-gradient(90deg, #FF6B00 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          opacity: theme === "dark" ? 0.08 : 0.04,
          background: "radial-gradient(circle, #FF6B00 0%, transparent 70%)",
        }}
      />

      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange mb-4 shadow-orange">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M4 8h24M4 8v16a2 2 0 002 2h20a2 2 0 002-2V8M4 8l2-4h20l2 4M12 14h8M12 18h8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="font-display text-4xl tracking-wider" style={{ color: "var(--text-primary)" }}>
            RETAIL TARGET
          </h1>
          <p
            className="text-sm font-body mt-1 tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Inventory Management System
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <h2
            className="font-body text-xl font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-7 font-body" style={{ color: "var(--text-secondary)" }}>
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 animate-fade-in">
              <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-red-400 text-sm font-body">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label
                className="text-xs font-semibold tracking-wider uppercase font-body block"
                style={{ color: "var(--text-secondary)" }}
              >
                Username
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                  size={16}
                />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="input-field pl-11"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                className="text-xs font-semibold tracking-wider uppercase font-body block"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                  size={16}
                />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-field pl-11 pr-11"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-brand-orange"
                  style={{ color: "var(--text-muted)" }}
                  tabIndex={-1}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.username || !form.password}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-6 font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          RETAIL TARGET MANAGEMENT · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
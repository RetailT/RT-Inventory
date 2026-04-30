import React, { useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from "react-icons/fi";

const CONFIG = {
  success: {
    icon: FiCheckCircle,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
  },
  error: {
    icon: FiXCircle,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
  },
  warning: {
    icon: FiAlertCircle,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
};

const Toast = ({ show, type = "success", message, onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  const cfg = CONFIG[type] || CONFIG.success;
  const Icon = cfg.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm"
        style={{
          background: "var(--bg-card)",
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${cfg.border}`,
        }}
      >
        {/* Colored left bar */}
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0"
          style={{ background: cfg.color, minHeight: "20px" }}
        />

        {/* Icon */}
        <div
          className="p-1.5 rounded-lg flex-shrink-0"
          style={{ background: cfg.bg }}
        >
          <Icon size={15} style={{ color: cfg.color }} />
        </div>

        {/* Message */}
        <p
          className="flex-1 text-sm font-body"
          style={{ color: "var(--text-primary)" }}
        >
          {message}
        </p>

        {/* Close */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded transition-opacity opacity-40 hover:opacity-100"
        >
          <FiX size={14} style={{ color: "var(--text-primary)" }} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
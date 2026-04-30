import React from "react";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";

const ConfirmDialog = ({
  open,
  danger = false,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)" }}
      >
        {/* Icon + Text */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="p-2.5 rounded-xl flex-shrink-0"
            style={{
              background: danger ? "rgba(239,68,68,0.1)" : "rgba(255,107,0,0.1)",
            }}
          >
            {danger ? (
              <FiAlertTriangle size={20} className="text-red-500" />
            ) : (
              <FiInfo size={20} style={{ color: "#FF6B00" }} />
            )}
          </div>
          <div>
            <h3
              className="font-display text-lg mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <p
              className="font-body text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="btn-ghost px-4 py-2 rounded-lg text-sm font-semibold font-body transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold font-body text-white transition-all active:scale-95"
            style={{
              background: danger ? "#dc2626" : "#FF6B00",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = "0.85")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = "1")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
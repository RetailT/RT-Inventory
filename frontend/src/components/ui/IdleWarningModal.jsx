import React, { useEffect, useState } from "react";
import { FiClock, FiAlertTriangle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const COUNTDOWN_SEC = 60; // must match warningMs / 1000

const IdleWarningModal = () => {
  const { showIdleWarning, setShowIdleWarning, logout } = useAuth();
  const [seconds, setSeconds] = useState(COUNTDOWN_SEC);

  // Reset countdown each time modal opens
  useEffect(() => {
    if (!showIdleWarning) return;
    setSeconds(COUNTDOWN_SEC);

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showIdleWarning]);

  if (!showIdleWarning) return null;

  const handleStayLoggedIn = () => {
    setShowIdleWarning(false);
    // Activity event will reset the idle timer automatically
    window.dispatchEvent(new MouseEvent("mousemove"));
  };

  const handleLogoutNow = async () => {
    setShowIdleWarning(false);
    await logout();
  };

  const progress = (seconds / COUNTDOWN_SEC) * 100;
  const isUrgent = seconds <= 15;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl p-6 animate-fade-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: isUrgent ? "rgba(239,68,68,0.15)" : "rgba(255,107,0,0.12)",
              border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : "rgba(255,107,0,0.3)"}`,
            }}
          >
            {isUrgent ? (
              <FiAlertTriangle size={24} style={{ color: "#ef4444" }} />
            ) : (
              <FiClock size={24} style={{ color: "#FF6B00" }} />
            )}
          </div>
        </div>

        {/* Text */}
        <h3
          className="text-center text-lg font-semibold font-body mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Session Timeout Warning
        </h3>
        <p
          className="text-center text-sm font-body mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          You've been inactive for a while. You'll be logged out automatically in:
        </p>

        {/* Countdown */}
        <div className="flex justify-center mb-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold font-mono"
            style={{
              background: isUrgent ? "rgba(239,68,68,0.1)" : "rgba(255,107,0,0.08)",
              border: `3px solid ${isUrgent ? "#ef4444" : "#FF6B00"}`,
              color: isUrgent ? "#ef4444" : "#FF6B00",
              transition: "all 0.3s ease",
            }}
          >
            {seconds}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full mb-6 overflow-hidden"
          style={{ background: "var(--bg-border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
              background: isUrgent ? "#ef4444" : "#FF6B00",
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLogoutNow}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-body transition-all"
            style={{
              background: "transparent",
              border: "1px solid var(--bg-border)",
              color: "var(--text-secondary)",
            }}
          >
            Logout Now
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-body transition-all btn-primary"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdleWarningModal;
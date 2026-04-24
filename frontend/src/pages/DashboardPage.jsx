import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiPackage,
  FiShoppingCart,
  FiTruck,
  FiAlertTriangle,
} from "react-icons/fi";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div
    className="card hover:border-brand-orange/30 transition-all duration-200 group cursor-default"
  >
    <div className="flex items-start justify-between">
      <div>
        <p
          className="text-xs font-semibold tracking-wider uppercase mb-2 font-body"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        <p
          className="text-3xl font-display tracking-wider"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
      >
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { icon: FiPackage,      label: "Total Products", value: "—", color: "bg-brand-orange" },
    { icon: FiShoppingCart, label: "Open Orders",    value: "—", color: "bg-blue-600" },
    { icon: FiTruck,        label: "Pending GRN",    value: "—", color: "bg-purple-600" },
    { icon: FiAlertTriangle,label: "Low Stock",      value: "—", color: "bg-red-600" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display text-3xl tracking-wider"
          style={{ color: "var(--text-primary)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1 font-body" style={{ color: "var(--text-muted)" }}>
          Welcome back,{" "}
          <span className="text-brand-orange font-semibold">{user?.username}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Placeholder */}
      <div
        className="card border-dashed text-center py-16"
        style={{ borderStyle: "dashed" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
          <FiPackage size={28} className="text-brand-orange" />
        </div>
        <p
          className="font-semibold font-body mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Inventory System Ready
        </p>
        <p className="text-sm font-body" style={{ color: "var(--text-muted)" }}>
          Use the navigation to access modules based on your permissions.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, permission }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (permission) {
    const hasAccess =
      user?.permissions?.[permission] === true ||
      user?.permissions?.[permission] === 1;
    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-brand-orange text-4xl font-display mb-2">403</p>
            <p className="text-brand-gray font-body">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

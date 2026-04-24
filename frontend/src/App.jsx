import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

// Placeholder page wrapper
const ComingSoon = ({ title }) => (
  <div className="animate-fade-in">
    <h1 className="font-display text-3xl tracking-wider mb-4" style={{ color: "var(--text-primary)" }}>
      {title}
    </h1>
    <div className="card border-dashed text-center py-16" style={{ borderStyle: "dashed" }}>
      <p className="font-body" style={{ color: "var(--text-muted)" }}>Module coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout><DashboardPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute permission="PRODUCTS">
                  <AppLayout><ComingSoon title="Products" /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders"
              element={
                <ProtectedRoute permission="PORDER">
                  <AppLayout><ComingSoon title="Purchase Orders" /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grn"
              element={
                <ProtectedRoute permission="GRN">
                  <AppLayout><ComingSoon title="GRN" /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/stock"
              element={
                <ProtectedRoute permission="STOCKREP">
                  <AppLayout><ComingSoon title="Stock Report" /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/sales"
              element={
                <ProtectedRoute permission="SALESREP">
                  <AppLayout><ComingSoon title="Sales Report" /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute permission="CONTROL">
                  <AppLayout><ComingSoon title="Settings" /></AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
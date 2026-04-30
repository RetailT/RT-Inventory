import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute    from "./components/auth/ProtectedRoute";   // ← fixed
import AppLayout         from "./components/layout/AppLayout";
import LoginPage         from "./pages/LoginPage";
import DashboardPage     from "./pages/DashboardPage";
import DepartmentPage    from "./pages/DepartmentPage";

const ComingSoon = ({ title }) => (
  <div className="animate-fade-in">
    <h1
      className="font-display text-3xl tracking-wider mb-4"
      style={{ color: "var(--text-primary)" }}
    >
      {title}
    </h1>
    <div className="card text-center py-16" style={{ borderStyle: "dashed" }}>
      <p className="font-body" style={{ color: "var(--text-muted)" }}>
        Module coming soon...
      </p>
    </div>
  </div>
);

const Protected = ({ children, permission }) => (
  <ProtectedRoute permission={permission}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/"      element={<Navigate to="/login" replace />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Protected><DashboardPage /></Protected>}
            />

            {/* Main modules */}
            <Route path="/products"
              element={<Protected permission="PRODUCTS"><ComingSoon title="Products" /></Protected>}
            />
            <Route path="/purchase-orders"
              element={<Protected permission="PORDER"><ComingSoon title="Purchase Orders" /></Protected>}
            />
            <Route path="/grn"
              element={<Protected permission="GRN"><ComingSoon title="GRN" /></Protected>}
            />

            {/* Master Details */}
            <Route path="/master/departments"
              element={<Protected permission="MASTERFILE"><DepartmentPage /></Protected>}
            />
            <Route path="/master/categories"
              element={<Protected permission="MASTERFILE"><ComingSoon title="Category Details" /></Protected>}
            />

            {/* Reports */}
            <Route path="/reports/stock"
              element={<Protected permission="STOCKREP"><ComingSoon title="Stock Report" /></Protected>}
            />
            <Route path="/reports/sales"
              element={<Protected permission="SALESREP"><ComingSoon title="Sales Report" /></Protected>}
            />

            {/* Settings */}
            <Route path="/settings"
              element={<Protected permission="CONTROL"><ComingSoon title="Settings" /></Protected>}
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
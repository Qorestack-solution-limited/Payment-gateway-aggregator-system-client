import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authSlice";
import "./index.css";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import { LandingPage } from "./Pages/LandingPage";
import { DashboardPage } from "./Pages/DashboardPage";
import { AnalyticsPage } from "./Pages/AnalyticsPage";
import { GatewaysPage } from "./Pages/GatewaysPage";
import { GatewayDetailPage } from "./Pages/GatewayDetailPage";
import { DeveloperPage } from "./Pages/DeveloperPage";
import { SettingsPage } from "./Pages/SettingsPage";
import { TransactionsPage } from "./Pages/TransactionsPage";
import { CustomersPage } from "./Pages/CustomersPage";
import { PayCallbackPage } from "./Pages/PayCallbackPage";
import { PublicPayPage } from "./Pages/PublicPayPage";
import { PaymentLinksPage } from "./Pages/PaymentLinksPage";
import { RoutingPage } from "./Pages/RoutingPage";
import { SettlementsPage } from "./Pages/SettlementsPage";

function ProtectedRoutes() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestRoutes() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Public pages — no auth required */}
      <Route path="/pay/callback" element={<PayCallbackPage />} />
      <Route path="/pay/:slug"    element={<PublicPayPage />} />

      {/* Auth pages */}
      <Route element={<GuestRoutes />}>
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
      </Route>

      {/* Protected pages */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard"      element={<DashboardPage />} />
        <Route path="/analytics"      element={<AnalyticsPage />} />
        <Route path="/gateways"       element={<GatewaysPage />} />
        <Route path="/gateways/:id"   element={<GatewayDetailPage />} />
        <Route path="/transactions"   element={<TransactionsPage />} />
        <Route path="/customers"      element={<CustomersPage />} />
        <Route path="/payment-links"  element={<PaymentLinksPage />} />
        <Route path="/routing"        element={<RoutingPage />} />
        <Route path="/settlements"    element={<SettlementsPage />} />
        <Route path="/developer"      element={<DeveloperPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

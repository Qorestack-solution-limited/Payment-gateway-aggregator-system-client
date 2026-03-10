import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./index.css";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import { LandingPage } from "./Pages/LandingPage";
import { DashboardPage } from "./Pages/DashboardPage";
import { AnalyticsPage } from "./Pages/AnalyticsPage";
import { GatewaysPage } from "./Pages/GatewaysPage";
import { DeveloperPage } from "./Pages/DeveloperPage";
import { SettingsPage } from "./Pages/SettingsPage";
import { TransactionsPage } from "./Pages/TransactionsPage";
const App = () => {
  const ProtectedRoutes = () => {
    const { user } = useAuth();
    return user ? <Outlet /> : <Navigate to="/login" />;
  };
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      {/* Pages Requiring Auth */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/gateways" element={<GatewaysPage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
      </Route>
    </Routes>
  );
};
export default App;

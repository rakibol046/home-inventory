import { Routes, Route, Navigate } from "react-router";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import Items from "../pages/Items/Items";
import ItemDetails from "../pages/ItemDetails/ItemDetails";
import Locations from "../pages/Locations/Locations";
import Categories from "../pages/Categories/Categories";
import Labels from "../pages/Labels/Labels";
import Reports from "../pages/Reports/Reports";
import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />

    {/* Protected Dashboard */}
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Dashboard />} />
      <Route path="/items" element={<Items />} />
      <Route path="/items/:id" element={<ItemDetails />} />
      <Route path="/locations" element={<Locations />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/labels" element={<Labels />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

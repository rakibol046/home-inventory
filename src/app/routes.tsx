import { Routes, Route, Navigate } from "react-router";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Inventory from "../pages/Inventory/Inventory";
import ItemDetails from "../pages/ItemDetails/ItemDetails";
import Locations from "../pages/Locations/Locations";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />

    {/* Protected Dashboard */}
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/:id" element={<ItemDetails />} />
      <Route path="/locations" element={<Locations />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

import { Routes, Route } from "react-router-dom";
import Landing from "./pages/auth/Landing";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/Profile";
import Orders from "./pages/customer/Orders";
import NewOrder from "./pages/customer/NewOrder";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/Profile";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryProfile from "./pages/delivery/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

document.documentElement.setAttribute("data-theme", "light");

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />

      {/* Customer */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/new-order"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <NewOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      {/* Delivery */}
      <Route
        path="/delivery/dashboard"
        element={
          <ProtectedRoute allowedRoles={["delivery"]}>
            <DeliveryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery/profile"
        element={
          <ProtectedRoute allowedRoles={["delivery"]}>
            <DeliveryProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

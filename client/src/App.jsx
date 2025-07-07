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

document.documentElement.setAttribute("data-theme", "light");

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      <Route path="/customer/orders" element={<Orders />} />
      <Route path="/customer/new-order" element={<NewOrder />} />
      <Route path="/customer/profile" element={<CustomerProfile />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/profile" element={<AdminProfile />} />

      {/* Delivery Agent Routes */}
      <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
      <Route path="/delivery/profile" element={<DeliveryProfile />} />

      {/* Redirect old dashboard route */}
      <Route path="/dashboard" element={<CustomerDashboard />} />
    </Routes>
  );
}

export default App;

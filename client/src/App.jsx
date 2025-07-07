import { Routes, Route } from "react-router-dom";
import Landing from "./pages/auth/Landing"; // ✅ Correct path
import Signin from "./pages/auth/Signin"; // ✅ Correct path
import Signup from "./pages/auth/Signup"; // ✅ Correct path
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Orders from "./pages/customer/Orders";
import NewOrder from "./pages/customer/NewOrder";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

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

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Delivery Agent Routes */}
      <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

      {/* Redirect old dashboard route */}
      <Route path="/dashboard" element={<CustomerDashboard />} />
    </Routes>
  );
}

export default App;

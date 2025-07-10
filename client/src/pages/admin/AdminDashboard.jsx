import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileIcon from "/profileIcon.png";
import API_BASE_URL from "../../config/api.js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Fetch orders from database on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "badge-warning";
      case "In Progress":
        return "badge-info";
      case "Ready for Delivery":
        return "badge-success";
      case "Completed":
        return "badge-neutral";
      default:
        return "badge-ghost";
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );

        setToast({
          type: "success",
          message: `Order ${orderId} updated to ${newStatus}`,
        });
        setTimeout(() => setToast(null), 3000);

        document.activeElement.blur();
      } else {
        console.error("Failed to update status:", data.message);
      }
    } catch (err) {
      console.error("Error updating status:", err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-700">
              LaundryOla Admin
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {user.name || "Admin User"}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email || "admin@laundryola.com"}
                </p>
              </div>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-100 p-1">
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <a onClick={() => navigate("/admin/profile")}>Profile</a>
                  </li>
                  <li>
                    <a onClick={handleLogout}>Logout</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Orders Table */}
        <div className="card bg-white p-6 shadow-lg">
          <h3 className="mb-6 text-xl font-bold">
            Orders Management ({orders.length} orders)
          </h3>

          {orders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-zebra table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Pickup Date</th>
                    <th>Delivery Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-semibold">{order.id}</td>
                      <td>{order.customerName}</td>
                      <td className="text-sm">{order.customerPhone}</td>
                      <td>
                        <span
                          className={`badge ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="font-semibold">৳{order.total}</td>
                      <td className="text-sm">
                        {formatDate(order.pickupDate)}
                      </td>
                      <td className="text-sm">
                        {formatDate(order.deliveryDate)}
                      </td>
                      <td>
                        <div className="dropdown dropdown-end">
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-xs btn-primary"
                          >
                            Update Status
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu rounded-box bg-base-100 w-52 border border-gray-200 p-2 shadow-xl"
                            style={{
                              position: "fixed",
                              zIndex: 9999,
                              transform: "translateX(-100%)",
                              marginTop: "8px",
                            }}
                          >
                            <li className="mb-1">
                              <a
                                onClick={() =>
                                  handleStatusChange(order.id, "Pending")
                                }
                                className="flex items-center hover:bg-amber-50"
                              >
                                <span className="badge badge-warning mr-2"></span>
                                Pending
                              </a>
                            </li>
                            <li className="mb-1">
                              <a
                                onClick={() =>
                                  handleStatusChange(order.id, "In Progress")
                                }
                                className="flex items-center hover:bg-blue-50"
                              >
                                <span className="badge badge-info mr-2"></span>
                                In Progress
                              </a>
                            </li>
                            <li className="mb-1">
                              <a
                                onClick={() =>
                                  handleStatusChange(
                                    order.id,
                                    "Ready for Delivery",
                                  )
                                }
                                className="flex items-center hover:bg-green-50"
                              >
                                <span className="badge badge-success mr-2"></span>
                                Ready for Delivery
                              </a>
                            </li>
                            <li>
                              <a
                                onClick={() =>
                                  handleStatusChange(order.id, "Completed")
                                }
                                className="flex items-center hover:bg-gray-100"
                              >
                                <span className="badge badge-neutral mr-2"></span>
                                Completed
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${
              toast.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

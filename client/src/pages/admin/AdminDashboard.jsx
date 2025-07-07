import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders } from "../../data/services";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([
    ...mockOrders,
    // Adding more mock orders for admin view
    {
      id: "ORD004",
      status: "Pending",
      services: [{ name: "Dry Cleaning", quantity: "3 items", price: 300 }],
      pickupDate: "2025-07-07",
      deliveryDate: "2025-07-09",
      total: 300,
      trackingStage: "Picked Up",
      customer: "Alice Johnson",
      phone: "+8801234567890",
      address: "House 45, Road 12, Dhanmondi, Dhaka",
    },
    {
      id: "ORD005",
      status: "In Progress",
      services: [
        { name: "Wash & Iron", quantity: "2 kg", price: 120 },
        { name: "Shoe Cleaning", quantity: "1 pair", price: 120 },
      ],
      pickupDate: "2025-07-06",
      deliveryDate: "2025-07-08",
      total: 240,
      trackingStage: "Washing",
      customer: "Bob Wilson",
      phone: "+8801987654321",
      address: "Apartment 8B, Gulshan Avenue, Gulshan, Dhaka",
    },
  ]);

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

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    alert(`Order ${orderId} status updated to ${newStatus}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    console.log("Admin logging out...");
    navigate("/");
  };

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-indigo-700">
                LaundryOla Admin - Orders Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">Admin User</p>
                <p className="text-sm text-gray-500">admin@laundryola.com</p>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Orders Table */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-6 text-xl">All Orders</h3>

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
                      <td>{order.customer}</td>
                      <td className="text-sm">{order.phone}</td>
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
                        {order.status !== "Completed" ? (
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
                              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow"
                            >
                              <li>
                                <a
                                  onClick={() =>
                                    handleStatusChange(order.id, "Pending")
                                  }
                                >
                                  Pending
                                </a>
                              </li>
                              <li>
                                <a
                                  onClick={() =>
                                    handleStatusChange(order.id, "In Progress")
                                  }
                                >
                                  In Progress
                                </a>
                              </li>
                              <li>
                                <a
                                  onClick={() =>
                                    handleStatusChange(
                                      order.id,
                                      "Ready for Delivery",
                                    )
                                  }
                                >
                                  Ready for Delivery
                                </a>
                              </li>
                              <li>
                                <a
                                  onClick={() =>
                                    handleStatusChange(order.id, "Completed")
                                  }
                                >
                                  Completed
                                </a>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Order Complete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

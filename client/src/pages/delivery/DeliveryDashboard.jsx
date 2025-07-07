import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders } from "../../data/services";

const DeliveryDashboard = () => {
  const navigate = useNavigate();

  // Mock delivery agent data
  const deliveryAgent = {
    name: "Delivery Agent",
    email: "agent@laundryola.com",
    id: "DA001",
  };

  // All available orders for pickup/delivery
  const [availableOrders] = useState([
    ...mockOrders,
    {
      id: "ORD004",
      status: "Pending",
      services: [{ name: "Dry Cleaning", quantity: "3 items", price: 300 }],
      pickupDate: "2025-07-07",
      deliveryDate: "2025-07-09",
      total: 300,
      customer: "Alice Johnson",
      phone: "+8801234567890",
      address: "House 45, Road 12, Dhanmondi, Dhaka",
      type: "pickup", // pickup from customer
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
      customer: "Bob Wilson",
      phone: "+8801987654321",
      address: "Apartment 8B, Gulshan Avenue, Gulshan, Dhaka",
      type: "pickup", // pickup from customer
    },
    {
      id: "ORD006",
      status: "Ready for Delivery",
      services: [{ name: "Wash & Fold", quantity: "2 kg", price: 80 }],
      pickupDate: "2025-07-05",
      deliveryDate: "2025-07-07",
      total: 80,
      customer: "Sarah Ahmed",
      phone: "+8801555666777",
      address: "Plot 15, Road 7, Uttara, Dhaka",
      type: "delivery", // delivery to customer
    },
  ]);

  // Orders accepted by this delivery agent
  const [myOrders, setMyOrders] = useState([]);

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

  const getTaskType = (order) => {
    if (order.status === "Pending") {
      return { text: "Pickup from Customer", color: "text-blue-600" };
    } else if (order.status === "Ready for Delivery") {
      return { text: "Deliver to Customer", color: "text-green-600" };
    }
    return { text: "Unknown", color: "text-gray-600" };
  };

  const handleAcceptOrder = (order) => {
    setMyOrders([
      ...myOrders,
      { ...order, acceptedAt: new Date().toISOString() },
    ]);
    alert(`Order ${order.id} accepted successfully!`);
  };

  const handleCompleteTask = (orderId) => {
    setMyOrders(myOrders.filter((order) => order.id !== orderId));
    alert(`Task completed for order ${orderId}!`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    console.log("Delivery agent logging out...");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your delivery agent account? This action cannot be undone.",
      )
    ) {
      console.log("Deleting delivery agent account...");
      // TODO: API call to delete account
      alert("Delivery agent account deleted successfully");
      navigate("/");
    }
  };

  // Filter orders that are not already accepted by this agent
  const pendingOrders = availableOrders.filter(
    (order) =>
      (order.status === "Pending" || order.status === "Ready for Delivery") &&
      !myOrders.find((myOrder) => myOrder.id === order.id),
  );

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-indigo-700">
                LaundryOla Delivery
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {deliveryAgent.name}
                </p>
                <p className="text-sm text-gray-500">{deliveryAgent.email}</p>
              </div>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="flex w-10 items-center justify-center rounded-full bg-indigo-100">
                    <span className="font-semibold text-indigo-600">
                      {deliveryAgent.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <a onClick={() => navigate("/delivery/profile")}>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </a>
                  </li>
                  <li>
                    <a onClick={handleLogout}>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* My Active Orders */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-6 text-xl">
                My Active Orders ({myOrders.length})
              </h3>

              {myOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No active orders yet. Accept orders from available list
                    below.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-zebra table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Task Type</th>
                        <th>Amount</th>
                        <th>Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map((order) => {
                        const taskType = getTaskType(order);
                        return (
                          <tr key={order.id}>
                            <td className="font-semibold">{order.id}</td>
                            <td>{order.customer}</td>
                            <td className="text-sm">{order.phone}</td>
                            <td>
                              <span className={`font-medium ${taskType.color}`}>
                                {taskType.text}
                              </span>
                            </td>
                            <td className="font-semibold">৳{order.total}</td>
                            <td className="max-w-xs truncate text-sm">
                              {order.address}
                            </td>
                            <td>
                              <button
                                onClick={() => handleCompleteTask(order.id)}
                                className="btn btn-xs btn-success"
                              >
                                Complete Task
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Available Orders to Accept */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-6 text-xl">
                Available Orders ({pendingOrders.length})
              </h3>

              {pendingOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No available orders at the moment.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-zebra table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Task Type</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => {
                        const taskType = getTaskType(order);
                        return (
                          <tr key={order.id}>
                            <td className="font-semibold">{order.id}</td>
                            <td>{order.customer}</td>
                            <td className="text-sm">{order.phone}</td>
                            <td>
                              <span className={`font-medium ${taskType.color}`}>
                                {taskType.text}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${getStatusColor(order.status)}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="font-semibold">৳{order.total}</td>
                            <td className="text-sm">
                              {order.status === "Pending"
                                ? formatDate(order.pickupDate)
                                : formatDate(order.deliveryDate)}
                            </td>
                            <td className="max-w-xs truncate text-sm">
                              {order.address}
                            </td>
                            <td>
                              <button
                                onClick={() => handleAcceptOrder(order)}
                                className="btn btn-xs btn-primary"
                              >
                                Accept Order
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

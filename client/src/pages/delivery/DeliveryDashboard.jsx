import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasingOrder, setReleasingOrder] = useState(null);

  // Fetch available orders from database
  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/orders/delivery-available",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (data.success) {
        setAvailableOrders(data.data);
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

  const getTaskType = (order) => {
    if (order.status === "Pending") {
      return { text: "Pickup from Customer", color: "text-blue-600" };
    } else if (order.status === "Ready for Delivery") {
      return { text: "Deliver to Customer", color: "text-green-600" };
    }
    return { text: "Unknown", color: "text-gray-600" };
  };

  const handleAcceptOrder = async (order) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/orders/${order.id}/accept`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        // Add to my orders
        setMyOrders([
          ...myOrders,
          { ...order, acceptedAt: new Date().toISOString() },
        ]);
        // Remove from available orders
        setAvailableOrders(availableOrders.filter((o) => o.id !== order.id));
        alert(`Order ${order.id} accepted successfully!`);
      } else {
        alert("Failed to accept order: " + data.message);
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Error accepting order. Please try again.");
    }
  };

  const handleReleaseOrder = async (orderId) => {
    // Show confirmation dialog
    const confirmRelease = window.confirm(
      `Are you sure you want to release Order #${orderId}? Other delivery agents will be able to accept it.`,
    );

    if (!confirmRelease) {
      return;
    }

    setReleasingOrder(orderId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/release`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        // Find the order in myOrders
        const releasedOrder = myOrders.find((order) => order.id === orderId);

        if (releasedOrder) {
          // Remove from my orders
          setMyOrders(myOrders.filter((order) => order.id !== orderId));

          // Add back to available orders (without acceptedAt field)
          const { acceptedAt, ...orderWithoutAcceptedAt } = releasedOrder;
          setAvailableOrders([...availableOrders, orderWithoutAcceptedAt]);
        }

        alert(
          `Order #${orderId} has been released. Other delivery agents can now accept it.`,
        );
      } else {
        alert("Failed to release order: " + data.message);
      }
    } catch (error) {
      console.error("Error releasing order:", error);
      alert("Error releasing order. Please try again.");
    } finally {
      setReleasingOrder(null);
    }
  };

  const handleCompleteTask = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        // Remove from my orders
        setMyOrders(myOrders.filter((order) => order.id !== orderId));
        alert(
          `Task completed for order ${orderId}! Order has been removed from database.`,
        );
      } else {
        alert("Failed to complete task: " + data.message);
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Error completing task. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Filter orders that are not already accepted by this agent
  const pendingOrders = availableOrders.filter(
    (order) =>
      (order.status === "Pending" || order.status === "Ready for Delivery") &&
      !myOrders.find((myOrder) => myOrder.id === order.id),
  );

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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-indigo-700">
                LaundryOla Delivery
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {user.name || "Delivery Agent"}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email || "agent@laundryola.com"}
                </p>
              </div>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="flex w-10 items-center justify-center rounded-full bg-indigo-100">
                    <span className="font-semibold text-indigo-600">
                      {user.name ? user.name.charAt(0) : "D"}
                    </span>
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <a onClick={() => navigate("/delivery/profile")}>Profile</a>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map((order) => {
                        const taskType = getTaskType(order);
                        return (
                          <tr key={order.id}>
                            <td className="font-semibold">{order.id}</td>
                            <td>{order.customerName}</td>
                            <td className="text-sm">{order.customerPhone}</td>
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
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCompleteTask(order.id)}
                                  className="btn btn-xs btn-success"
                                >
                                  Complete Task
                                </button>
                                <button
                                  onClick={() => handleReleaseOrder(order.id)}
                                  className="btn btn-xs btn-warning btn-outline"
                                  disabled={releasingOrder === order.id}
                                >
                                  {releasingOrder === order.id ? (
                                    <>
                                      <span className="loading loading-spinner loading-xs"></span>
                                      Releasing...
                                    </>
                                  ) : (
                                    "Release Order"
                                  )}
                                </button>
                              </div>
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
                            <td>{order.customerName}</td>
                            <td className="text-sm">{order.customerPhone}</td>
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

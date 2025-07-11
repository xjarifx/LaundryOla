import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api.js";

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasingOrder, setReleasingOrder] = useState(null);
  const [completingOrder, setCompletingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch available orders from database
  useEffect(() => {
    fetchAvailableOrders();
    fetchMyOrders(); // Add this line to fetch assigned orders on load
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/orders/delivery-available`,
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
        showToast("Failed to load orders", "error");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Error loading orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to fetch orders assigned to current delivery agent
  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders/my-deliveries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      console.log("My Orders Response:", data); // Debug log

      if (data.success) {
        setMyOrders(data.data);
        console.log("My Orders Set:", data.data); // Debug log
      } else {
        console.error("Failed to fetch my orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching my orders:", error);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ready for Delivery":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getTaskType = (order) => {
    if (order.status === "Pending") {
      return {
        text: "Pickup from Customer",
        color: "text-blue-600",
        icon: "M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    } else if (order.status === "Ready for Delivery") {
      return {
        text: "Deliver to Customer",
        color: "text-green-600",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      };
    }
    return {
      text: "Unknown",
      color: "text-gray-600",
      icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    };
  };

  const handleAcceptOrder = async (order) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${order.id}/accept`,
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
        // Refresh both lists to ensure data consistency
        await Promise.all([fetchAvailableOrders(), fetchMyOrders()]);
        showToast(`Order #${order.id} accepted successfully!`, "success");
      } else {
        showToast("Failed to accept order: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      showToast("Error accepting order. Please try again.", "error");
    }
  };

  const handleReleaseOrder = async (orderId) => {
    if (
      !window.confirm(
        `Are you sure you want to release Order #${orderId}? Other delivery agents will be able to accept it.`,
      )
    ) {
      return;
    }

    setReleasingOrder(orderId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/release`,
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
        // Refresh both lists to ensure data consistency
        await Promise.all([fetchAvailableOrders(), fetchMyOrders()]);
        showToast(
          `Order #${orderId} has been released successfully.`,
          "success",
        );
      } else {
        showToast("Failed to release order: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error releasing order:", error);
      showToast("Error releasing order. Please try again.", "error");
    } finally {
      setReleasingOrder(null);
    }
  };

  const handleCompleteTask = async (orderId) => {
    if (
      !window.confirm(
        `Are you sure you want to complete Order #${orderId}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setCompletingOrder(orderId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/complete`,
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
        // Refresh both lists to ensure data consistency
        await Promise.all([fetchAvailableOrders(), fetchMyOrders()]);
        showToast(
          `Task completed for Order #${orderId}! Order has been removed from database.`,
          "success",
        );
      } else {
        showToast("Failed to complete task: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      showToast("Error completing task. Please try again.", "error");
    } finally {
      setCompletingOrder(null);
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

  // Calculate statistics
  const stats = {
    activeOrders: myOrders.length,
    availableOrders: pendingOrders.length,
    totalEarnings: myOrders.reduce((sum, order) => sum + (order.total || 0), 0),
    completedToday: 0, // This would need to be calculated based on completed orders today
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-100">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-teal-600/30 border-t-teal-600"></div>
            <p className="text-lg text-gray-600">
              Loading delivery dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-teal-300 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-300 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-emerald-300 opacity-10 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
                    Delivery Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your delivery tasks
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden text-right md:block">
                <p className="font-semibold text-gray-800">
                  {user.name || "Delivery Agent"}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email || "agent@laundryola.com"}
                </p>
              </div>
              {/*// z-index effect */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 transition-all duration-300 hover:scale-105"
                >
                  <span className="font-semibold text-teal-700">
                    {user.name ? user.name.charAt(0).toUpperCase() : "D"}
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu z-[1] w-52 rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur-lg"
                >
                  <li>
                    <button
                      onClick={() => navigate("/delivery/profile")}
                      className="rounded-xl px-4 py-3 transition-colors hover:bg-teal-50"
                    >
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
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
                    >
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
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative  container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    Active Orders
                  </p>
                  <p className="text-3xl font-bold text-teal-600">
                    {stats.activeOrders}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    Available Orders
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.availableOrders}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    Today's Earnings
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ৳{stats.totalEarnings}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    Completed Today
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.completedToday}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* My Active Orders */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  My Active Orders
                </h2>
              </div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-800">
                {myOrders.length} Active
              </span>
            </div>

            {myOrders.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-12 w-12 text-gray-400"
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
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  No Active Orders
                </h3>
                <p className="text-gray-600">
                  Accept orders from the available list below to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  const taskType = getTaskType(order);
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                        {/* Left Side - Customer Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100">
                              <svg
                                className="h-6 w-6 text-teal-600"
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
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">
                                {order.customerName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.customerPhone} • Order #{order.id}
                              </p>
                            </div>
                          </div>

                          <div className="ml-15 space-y-2">
                            <div className="flex items-center space-x-2">
                              <svg
                                className={`h-4 w-4 ${taskType.color}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={taskType.icon}
                                />
                              </svg>
                              <span
                                className={`text-sm font-medium ${taskType.color}`}
                              >
                                {taskType.text}
                              </span>
                            </div>

                            <div className="flex items-start space-x-2">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <p className="text-sm leading-tight text-gray-600">
                                {order.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Status & Actions */}
                        <div className="flex flex-col items-end space-y-4 md:min-w-[250px]">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              ৳{order.total}
                            </span>
                          </div>

                          <div className="flex w-full flex-col gap-2 sm:flex-row">
                            <button
                              onClick={() => handleCompleteTask(order.id)}
                              className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={completingOrder === order.id}
                            >
                              {completingOrder === order.id ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                  <span>Completing...</span>
                                </div>
                              ) : (
                                "Complete Task"
                              )}
                            </button>

                            <button
                              onClick={() => handleReleaseOrder(order.id)}
                              className="flex-1 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-all duration-300 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={releasingOrder === order.id}
                            >
                              {releasingOrder === order.id ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600/30 border-t-amber-600"></div>
                                  <span>Releasing...</span>
                                </div>
                              ) : (
                                "Release"
                              )}
                            </button>

                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Orders to Accept */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Orders
                </h2>
              </div>
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
                {pendingOrders.length} Available
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-12 w-12 text-gray-400"
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
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  No Available Orders
                </h3>
                <p className="text-gray-600">
                  Check back later for new delivery opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => {
                  const taskType = getTaskType(order);
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                        {/* Left Side - Customer Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                              <svg
                                className="h-6 w-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">
                                {order.customerName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.customerPhone} • Order #{order.id}
                              </p>
                            </div>
                          </div>

                          <div className="ml-15 space-y-2">
                            <div className="flex items-center space-x-2">
                              <svg
                                className={`h-4 w-4 ${taskType.color}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={taskType.icon}
                                />
                              </svg>
                              <span
                                className={`text-sm font-medium ${taskType.color}`}
                              >
                                {taskType.text}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <svg
                                className="h-4 w-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {order.status === "Pending"
                                  ? formatDate(order.pickupDate)
                                  : formatDate(order.deliveryDate)}
                              </span>
                            </div>

                            <div className="flex items-start space-x-2">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <p className="text-sm leading-tight text-gray-600">
                                {order.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Status & Actions */}
                        <div className="flex flex-col items-end space-y-4 md:min-w-[200px]">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              ৳{order.total}
                            </span>
                          </div>

                          <div className="flex w-full flex-col gap-2 sm:flex-row">
                            <button
                              onClick={() => handleAcceptOrder(order)}
                              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                            >
                              Accept Order
                            </button>

                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                Order #{selectedOrder.id} Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Customer
                  </label>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedOrder.customerPhone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(
                        selectedOrder.status,
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Amount
                  </label>
                  <p className="mt-1 text-2xl font-bold text-teal-600">
                    ৳{selectedOrder.total}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Address
                </label>
                <p className="mt-1 text-gray-900">{selectedOrder.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Task Type
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  {(() => {
                    const taskType = getTaskType(selectedOrder);
                    return (
                      <>
                        <svg
                          className={`h-5 w-5 ${taskType.color}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={taskType.icon}
                          />
                        </svg>
                        <span className={`font-medium ${taskType.color}`}>
                          {taskType.text}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
              >
                Close
              </button>

              {!myOrders.find((order) => order.id === selectedOrder.id) ? (
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    handleAcceptOrder(selectedOrder);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Accept Order
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    handleCompleteTask(selectedOrder.id);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                  disabled={completingOrder === selectedOrder.id}
                >
                  {completingOrder === selectedOrder.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      <span>Completing...</span>
                    </div>
                  ) : (
                    "Complete Task"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="animate-in slide-in-from-right fixed top-4 right-4 z-50 duration-300">
          <div
            className={`rounded-2xl border-0 p-4 shadow-2xl ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              {toast.type === "success" ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;

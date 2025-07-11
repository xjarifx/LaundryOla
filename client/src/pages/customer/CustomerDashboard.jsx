import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileIcon from "/profileIcon.png";
import API_BASE_URL from "../../config/api.js";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch customer orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders/customer`, {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "Pending").length,
    inProgressOrders: orders.filter((order) => order.status === "In Progress")
      .length,
    completedOrders: orders.filter((order) => order.status === "Completed")
      .length,
    totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
  };

  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-cyan-300 opacity-10 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h6.5l4.5 4.5v8.5a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                    LaundryOla
                  </h1>
                  <p className="text-sm text-gray-500">Customer Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden text-right md:block">
                <p className="font-semibold text-gray-800">
                  {user.name || "Guest User"}
                </p>
                <p className="text-sm text-gray-500">
                  {user.email || "customer@laundryola.com"}
                </p>
              </div>
              <div className="relative z-[9999]">
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="h-12 w-12 cursor-pointer rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-2 transition-all duration-300 hover:shadow-lg"
                  >
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu z-[99999] mt-2 w-52 rounded-2xl border border-white/20 bg-white/90 p-2 shadow-2xl backdrop-blur-lg"
                  >
                    <li>
                      <button
                        onClick={() => navigate("/customer/profile")}
                        className="flex items-center space-x-3 rounded-xl px-4 py-3 transition-colors hover:bg-blue-50"
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
                        <span>Profile</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
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
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col items-center space-y-6 md:flex-row md:space-y-0 md:space-x-8">
              <div className="relative">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-4 shadow-lg">
                  <img
                    src={profileIcon}
                    alt="Customer Profile"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="absolute -right-2 -bottom-2 h-6 w-6 rounded-full border-2 border-white bg-green-500"></div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.name || "Valued Customer"}!
                </h2>
                <p className="mt-2 text-gray-600">
                  Ready to get your laundry done? We're here to help!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalOrders}
                  </div>
                  <div className="text-xs text-blue-700">Total Orders</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedOrders}
                  </div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    ৳{stats.totalSpent}
                  </div>
                  <div className="text-xs text-purple-700">Total Spent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Orders */}
            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalOrders}
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-amber-600">
                    {stats.pendingOrders}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 transition-transform duration-300 group-hover:scale-110">
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

            {/* In Progress */}
            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.inProgressOrders}
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.completedOrders}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* New Order Button */}
            <button
              onClick={() => navigate("/customer/new-order")}
              className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex flex-col items-center space-y-4 text-white">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Place New Order</h3>
                  <p className="mt-2 text-blue-100">
                    Start a new laundry order today
                  </p>
                </div>
              </div>
            </button>

            {/* View Orders Button */}
            <button
              onClick={() => navigate("/customer/orders")}
              className="group hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-8 w-8 text-white"
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
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">My Orders</h3>
                  <p className="mt-2 text-gray-600">
                    Track and manage your orders
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

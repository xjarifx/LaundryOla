import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api.js";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // Fetch orders from API with authentication
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCancelOrder = async (orderId) => {
    // Show confirmation dialog
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel Order #${orderId}? This action cannot be undone.`,
    );

    if (!confirmCancel) {
      return;
    }

    setCancellingOrder(orderId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/cancel`,
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
        // Update the order status in the local state
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: "Cancelled" } : order,
          ),
        );

        showToast(
          `Order #${orderId} has been cancelled successfully.`,
          "success",
        );
      } else {
        showToast(`Failed to cancel order: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      showToast("Error cancelling order. Please try again.", "error");
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleReorder = async (order) => {
    try {
      // Navigate to new order page with pre-filled data
      navigate("/customer/new-order", {
        state: {
          reorderData: {
            services: order.services,
            instructions: order.instructions || "",
          },
        },
      });
    } catch (error) {
      console.error("Error processing reorder:", error);
      showToast("Error processing reorder. Please try again.", "error");
    }
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
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getTrackingProgress = (stage) => {
    switch (stage) {
      case "Picked Up":
        return 25;
      case "Processing":
        return 50;
      case "Ready":
        return 75;
      case "Delivered":
        return 100;
      case "Cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canCancelOrder = (status) => {
    return status === "Pending" || status === "In Progress";
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    inProgress: orders.filter((o) => o.status === "In Progress").length,
    completed: orders.filter((o) => o.status === "Completed").length,
    cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600"></div>
          <p className="text-lg text-gray-600">Loading your orders...</p>
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
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600">
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
                <div>
                  <h1 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-2xl font-bold text-transparent">
                    My Orders
                  </h1>
                  <p className="text-sm text-gray-500">
                    Track your laundry orders
                  </p>
                </div>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
              {orders.length} Total Orders
            </span>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Order Statistics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {orderStats.total}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {orderStats.pending}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orderStats.inProgress}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orderStats.completed}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {orderStats.cancelled}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Search orders by ID or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Filter:
                </label>
                <select
                  className="rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => navigate("/customer/new-order")}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  New Order
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-white/20 bg-white/80 p-16 shadow-2xl backdrop-blur-lg">
              <div className="text-center">
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
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {searchTerm || filterStatus !== "all"
                    ? "No matching orders"
                    : "No Orders Yet"}
                </h3>
                <p className="mb-8 text-gray-600">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "You haven't placed any orders yet. Start by creating your first order!"}
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <button
                    onClick={() => navigate("/customer/new-order")}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Place Your First Order
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="hover:shadow-3xl rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg transition-all duration-300"
                >
                  {/* Order Header */}
                  <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.pickupDate)} • Delivery:{" "}
                        {formatDate(order.deliveryDate)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center space-x-4 md:mt-0">
                      <span
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        ৳{order.total}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Progress */}
                  {order.status !== "Cancelled" && (
                    <div className="mb-6">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Order Progress
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.trackingStage}
                        </span>
                      </div>
                      <div className="mb-2 h-3 w-full rounded-full bg-gray-200">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                          style={{
                            width: `${getTrackingProgress(order.trackingStage)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Picked Up</span>
                        <span>Processing</span>
                        <span>Ready</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Order Message */}
                  {order.status === "Cancelled" && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium text-red-800">
                          This order has been cancelled
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Services Summary */}
                  <div className="mb-6">
                    <h4 className="mb-3 text-lg font-semibold text-gray-900">
                      Services Ordered
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {order.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {service.name}
                            </span>
                            <br />
                            <span className="text-sm text-gray-600">
                              {service.quantity}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">
                            ৳{service.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:shadow-lg"
                    >
                      View Details
                    </button>

                    {(order.status === "Completed" ||
                      order.status === "Cancelled") && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                      >
                        Reorder
                      </button>
                    )}

                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex-1 rounded-xl border border-red-300 bg-red-50 px-6 py-3 font-semibold text-red-700 transition-all duration-300 hover:bg-red-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={cancellingOrder === order.id}
                      >
                        {cancellingOrder === order.id ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600"></div>
                            <span>Cancelling...</span>
                          </div>
                        ) : (
                          "Cancel Order"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Total Amount
                  </label>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    ৳{selectedOrder.total}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Pickup Date
                  </label>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatDate(selectedOrder.pickupDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Delivery Date
                  </label>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatDate(selectedOrder.deliveryDate)}
                  </p>
                </div>
              </div>

              {/* Services Detail */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Services Ordered
                </label>
                <div className="mt-3 space-y-3">
                  {selectedOrder.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {service.quantity}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        ৳{service.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Timeline */}
              {selectedOrder.status !== "Cancelled" && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Order Timeline
                  </label>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      {["Picked Up", "Processing", "Ready", "Delivered"].map(
                        (stage, index) => {
                          const isCompleted =
                            getTrackingProgress(selectedOrder.trackingStage) >
                            index * 25;
                          return (
                            <div
                              key={stage}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                  isCompleted
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <span
                                className={`mt-2 text-xs ${isCompleted ? "text-blue-600" : "text-gray-500"}`}
                              >
                                {stage}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{
                          width: `${getTrackingProgress(selectedOrder.trackingStage)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancelled Status */}
              {selectedOrder.status === "Cancelled" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-red-800">
                      This order was cancelled
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
              >
                Close
              </button>

              {(selectedOrder.status === "Completed" ||
                selectedOrder.status === "Cancelled") && (
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    handleReorder(selectedOrder);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  Reorder
                </button>
              )}

              {canCancelOrder(selectedOrder.status) && (
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    handleCancelOrder(selectedOrder.id);
                  }}
                  className="flex-1 rounded-xl border border-red-300 bg-red-50 px-6 py-3 font-semibold text-red-700 transition-all duration-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={cancellingOrder === selectedOrder.id}
                >
                  {cancellingOrder === selectedOrder.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600"></div>
                      <span>Cancelling...</span>
                    </div>
                  ) : (
                    "Cancel Order"
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

export default Orders;

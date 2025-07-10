import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api.js";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  // Fetch orders from API with authentication
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        console.log("Orders fetched successfully:", data.data);
      } else {
        console.error("Failed to fetch orders:", data.message);
        if (
          data.message.includes("token") ||
          data.message.includes("authentication")
        ) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    // Show confirmation dialog
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel Order #${orderId}? This action cannot be undone.`
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
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update the order status in the local state
        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? { ...order, status: "Cancelled" }
              : order
          )
        );

        alert(`Order #${orderId} has been cancelled successfully.`);
      } else {
        alert(`Failed to cancel order: ${data.message}`);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Error cancelling order. Please try again.");
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
      alert("Error processing reorder. Please try again.");
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
      case "Cancelled":
        return "badge-error";
      default:
        return "badge-ghost";
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

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return status === "Pending" || status === "In Progress";
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-base-200 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-2 text-gray-600">Loading your orders...</p>
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
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="btn btn-ghost btn-circle"
              >
                <svg
                  className="h-6 w-6"
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
              <h1 className="text-2xl font-bold text-indigo-700">My Orders</h1>
            </div>
            <span className="text-sm text-gray-500">LaundryOla</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="card bg-white shadow-lg">
              <div className="card-body py-16 text-center">
                <svg
                  className="mx-auto mb-4 h-24 w-24 text-gray-300"
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
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  No Orders Yet
                </h3>
                <p className="mb-6 text-gray-500">
                  You haven't placed any orders yet. Start by creating your
                  first order!
                </p>
                <button
                  onClick={() => navigate("/customer/new-order")}
                  className="btn btn-primary"
                >
                  Place Your First Order
                </button>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="card bg-white shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="card-body">
                  {/* Order Header */}
                  <div className="mb-4 flex flex-col justify-between md:flex-row md:items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.pickupDate)} • Delivery:{" "}
                        {formatDate(order.deliveryDate)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center space-x-3 md:mt-0">
                      <span
                        className={`badge ${getStatusColor(order.status)} badge-lg`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xl font-bold text-indigo-600">
                        ৳{order.total}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Progress */}
                  {order.status !== "Cancelled" && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Order Progress
                        </span>
                        <span className="text-sm text-gray-500">
                          {order.trackingStage}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                          style={{
                            width: `${getTrackingProgress(order.trackingStage)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>Picked Up</span>
                        <span>Processing</span>
                        <span>Ready</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Order Message */}
                  {order.status === "Cancelled" && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-red-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-red-700 font-medium">
                          This order has been cancelled
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Services Summary */}
                  <div className="mb-4">
                    <h4 className="mb-2 font-semibold text-gray-700">
                      Services:
                    </h4>
                    <div className="space-y-1">
                      {order.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {service.name} ({service.quantity})
                          </span>
                          <span className="font-medium text-gray-800">
                            ৳{service.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      View Details
                    </button>

                    {order.status === "Completed" && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        Reorder
                      </button>
                    )}

                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="btn btn-error btn-outline btn-sm flex-1"
                        disabled={cancellingOrder === order.id}
                      >
                        {cancellingOrder === order.id ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Order"
                        )}
                      </button>
                    )}

                    {order.status === "Cancelled" && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="btn btn-success btn-outline btn-sm flex-1"
                      >
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold">
                Order #{selectedOrder.id} Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* Order Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <p
                    className={`badge ${getStatusColor(selectedOrder.status)} mt-1`}
                  >
                    {selectedOrder.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Total Amount
                  </label>
                  <p className="mt-1 text-lg font-bold text-indigo-600">
                    ৳{selectedOrder.total}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Pickup Date
                  </label>
                  <p className="mt-1 text-gray-800">
                    {formatDate(selectedOrder.pickupDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Delivery Date
                  </label>
                  <p className="mt-1 text-gray-800">
                    {formatDate(selectedOrder.deliveryDate)}
                  </p>
                </div>
              </div>

              {/* Detailed Services */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Services Ordered
                </label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {service.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-800">
                        ৳{service.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline */}
              {selectedOrder.status !== "Cancelled" && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Order Timeline
                  </label>
                  <div className="mt-2">
                    <div className="steps steps-vertical lg:steps-horizontal w-full">
                      <div
                        className={`step ${getTrackingProgress(selectedOrder.trackingStage) >= 25 ? "step-primary" : ""
                          }`}
                      >
                        Picked Up
                      </div>
                      <div
                        className={`step ${getTrackingProgress(selectedOrder.trackingStage) >= 50 ? "step-primary" : ""
                          }`}
                      >
                        Processing
                      </div>
                      <div
                        className={`step ${getTrackingProgress(selectedOrder.trackingStage) >= 75 ? "step-primary" : ""
                          }`}
                      >
                        Ready
                      </div>
                      <div
                        className={`step ${getTrackingProgress(selectedOrder.trackingStage) >= 100 ? "step-primary" : ""
                          }`}
                      >
                        Delivered
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancelled Order Info */}
              {selectedOrder.status === "Cancelled" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-700 font-medium">Order Cancelled</span>
                  </div>
                  <p className="text-red-600 text-sm">
                    This order was cancelled and no charges were applied. You can
                    place a new order with the same services using the "Reorder"
                    button.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-outline"
              >
                Close
              </button>

              {selectedOrder.status === "Completed" && (
                <button
                  onClick={() => handleReorder(selectedOrder)}
                  className="btn btn-primary"
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
                  className="btn btn-error"
                  disabled={cancellingOrder === selectedOrder.id}
                >
                  {cancellingOrder === selectedOrder.id ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Order"
                  )}
                </button>
              )}

              {selectedOrder.status === "Cancelled" && (
                <button
                  onClick={() => handleReorder(selectedOrder)}
                  className="btn btn-success"
                >
                  Reorder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

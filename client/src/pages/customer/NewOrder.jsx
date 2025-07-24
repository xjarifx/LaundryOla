import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../../config/api.js";

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [orderForm, setOrderForm] = useState({
    pickupDate: "",
    pickupTime: "",
    instructions: "",
    // Add temporary customer info fields
    customerName: user.name || "",
    customerPhone: user.phone || "",
    customerAddress: user.address || "",
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Handle reorder data from location state
  useEffect(() => {
    if (location.state?.reorderData) {
      const { services: reorderServices, instructions } =
        location.state.reorderData;
      setOrderForm((prev) => ({
        ...prev,
        instructions: instructions || "",
        // Keep the customer info from user data
        customerName: user.name || "",
        customerPhone: user.phone || "",
        customerAddress: user.address || "",
      }));

      // Pre-select services when services are loaded
      if (services.length > 0 && reorderServices) {
        const preSelectedServices = reorderServices
          .map((reorderService) => {
            const matchingService = services.find(
              (s) => s.name === reorderService.name,
            );
            if (matchingService) {
              return {
                ...matchingService,
                quantity:
                  parseFloat(reorderService.quantity.split(" ")[0]) || 1,
                total:
                  matchingService.price *
                  (parseFloat(reorderService.quantity.split(" ")[0]) || 1),
              };
            }
            return null;
          })
          .filter(Boolean);
        setSelectedServices(preSelectedServices);
      }
    }
  }, [location.state, services]);

  // Initialize customer info when user data is available
  useEffect(() => {
    // Only set initial values if all fields are empty
    setOrderForm((prev) => {
      if (!prev.customerName && !prev.customerPhone && !prev.customerAddress) {
        return {
          ...prev,
          customerName: user.name || "",
          customerPhone: user.phone || "",
          customerAddress: user.address || "",
        };
      }
      return prev;
    });
  }, []); // <-- Remove [user], run only once on mount

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/services`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
      } else {
        console.error("Failed to fetch services:", data.message);
        showToast("Failed to load services", "error");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      showToast("Error loading services", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleServiceSelection = (service, quantity) => {
    const existingIndex = selectedServices.findIndex(
      (s) => s.id === service.id,
    );

    if (quantity === 0 || quantity === "") {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else if (existingIndex >= 0) {
      const updated = [...selectedServices];
      updated[existingIndex] = {
        ...service,
        quantity: parseFloat(quantity),
        total: service.price * parseFloat(quantity),
      };
      setSelectedServices(updated);
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          ...service,
          quantity: parseFloat(quantity),
          total: service.price * parseFloat(quantity),
        },
      ]);
    }
  };

  const adjustQuantity = (service, increment) => {
    const currentQuantity = getServiceQuantity(service.id) || 0;
    const step = service.type === "weight" ? 0.5 : 1;
    const newQuantity = Math.max(
      0,
      currentQuantity + (increment ? step : -step),
    );
    handleServiceSelection(service, newQuantity);
  };

  const getServiceQuantity = (serviceId) => {
    const service = selectedServices.find((s) => s.id === serviceId);
    return service ? service.quantity : "";
  };

  const getOrderTotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.total, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedServices.length === 0) {
      newErrors.services = "Please select at least one service";
    }

    if (!orderForm.pickupDate) {
      newErrors.pickupDate = "Pickup date is required";
    } else {
      const selectedDate = new Date(orderForm.pickupDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.pickupDate = "Pickup date cannot be in the past";
      }
    }

    if (!orderForm.pickupTime) {
      newErrors.pickupTime = "Pickup time is required";
    }

    // Validate temporary customer info
    if (!orderForm.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!orderForm.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    }

    if (!orderForm.customerAddress.trim()) {
      newErrors.customerAddress = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors before submitting", "error");
      return;
    }

    const orderData = {
      customerName: orderForm.customerName.trim(),
      phone: orderForm.customerPhone.trim(),
      address: orderForm.customerAddress.trim(),
      pickupDate: orderForm.pickupDate,
      pickupTime: orderForm.pickupTime,
      instructions: orderForm.instructions,
      services: selectedServices,
      total: getOrderTotal(),
    };

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          `Order placed successfully! Order ID: ${data.data.orderId}`,
          "success",
        );
        setTimeout(() => navigate("/customer/orders"), 2000);
      } else {
        showToast("Failed to place order: " + data.message, "error");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showToast("Error placing order. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to reset customer info to original
  const resetCustomerInfo = () => {
    setOrderForm((prev) => ({
      ...prev,
      customerName: user.name || "",
      customerPhone: user.phone || "",
      customerAddress: user.address || "",
    }));
    // Clear related errors
    setErrors((prev) => ({
      ...prev,
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600"></div>
          <p className="text-lg text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-cyan-300 opacity-10 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  navigate("/customer/dashboard");
                  window.location.reload(); // Force page refresh as temporary fix
                }}
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                    New Order
                  </h1>
                  <p className="text-sm text-gray-500">
                    Place your laundry order
                  </p>
                </div>
              </div>
            </div>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
              LaundryOla
            </span>
          </div>
        </div>
      </header>

      <div className="container relative z-10 mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Progress Indicator */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  1
                </div>
                <span className="font-medium text-gray-900">
                  Select Services
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-1 w-12 rounded-full bg-blue-200">
                  <div
                    className="h-1 rounded-full bg-blue-600"
                    style={{
                      width: selectedServices.length > 0 ? "100%" : "0%",
                    }}
                  ></div>
                </div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${selectedServices.length > 0 ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  2
                </div>
                <span
                  className={`font-medium ${selectedServices.length > 0 ? "text-gray-900" : "text-gray-400"}`}
                >
                  Order Details
                </span>
              </div>
            </div>
          </div>

          {/* Service Selection */}
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Select Services
                </h2>
              </div>
              {errors.services && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2">
                  <span className="text-sm font-medium text-red-700">
                    {errors.services}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  {/* Service Header */}
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        {service.name}
                      </h3>
                      <div className="rounded-full bg-blue-100 px-3 py-1">
                        <span className="text-xs font-semibold text-blue-700">
                          {service.duration}
                        </span>
                      </div>
                    </div>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {service.description}
                    </p>
                    <div className="text-2xl font-bold text-blue-600">
                      ৳{service.price}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        {service.unit}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {service.type === "weight" ? "Weight (kg)" : "Quantity"}
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => adjustQuantity(service, false)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-all duration-300 hover:scale-110 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={
                            !getServiceQuantity(service.id) ||
                            getServiceQuantity(service.id) <= 0
                          }
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
                              d="M20 12H4"
                            />
                          </svg>
                        </button>

                        <input
                          type="number"
                          min="0"
                          step={service.type === "weight" ? "0.5" : "1"}
                          className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="0"
                          value={getServiceQuantity(service.id)}
                          onChange={(e) =>
                            handleServiceSelection(service, e.target.value)
                          }
                        />

                        <button
                          type="button"
                          onClick={() => adjustQuantity(service, true)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white transition-all duration-300 hover:scale-110 hover:bg-green-600"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Service Total */}
                    {getServiceQuantity(service.id) > 0 && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700">
                            Subtotal:
                          </span>
                          <span className="text-lg font-bold text-blue-900">
                            ৳
                            {(
                              service.price * getServiceQuantity(service.id)
                            ).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {selectedServices.length > 0 && (
            <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-2xl backdrop-blur-lg">
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
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
                  Order Summary
                </h2>
              </div>

              <div className="space-y-4">
                {selectedServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl bg-white/80 p-4 shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <span className="text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {service.quantity} {service.unit.replace("per ", "")}{" "}
                          × ৳{service.price}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      ৳{service.total.toFixed(0)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      ৳{getOrderTotal().toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Form */}
          {selectedServices.length > 0 && (
            <form
              onSubmit={handleOrderSubmit}
              className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg"
            >
              <div className="mb-8 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
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
                  Pickup Details
                </h2>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customer Information
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={resetCustomerInfo}
                        className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-200"
                      >
                        Reset to Profile
                      </button>
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Changes here won't update your profile</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Customer Name */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
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
                        <span>Customer Name *</span>
                      </label>
                      <input
                        type="text"
                        value={orderForm.customerName}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            customerName: e.target.value,
                          })
                        }
                        className={`w-full rounded-lg border px-4 py-3 transition-colors ${
                          errors.customerName
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter customer name"
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerName}
                        </p>
                      )}
                    </div>

                    {/* Customer Phone */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>Phone Number *</span>
                      </label>
                      <input
                        type="tel"
                        value={orderForm.customerPhone}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            customerPhone: e.target.value,
                          })
                        }
                        className={`w-full rounded-lg border px-4 py-3 transition-colors ${
                          errors.customerPhone
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter phone number"
                      />
                      {errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerPhone}
                        </p>
                      )}
                    </div>

                    {/* Customer Address */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>Pickup Address *</span>
                      </label>
                      <textarea
                        rows={3}
                        value={orderForm.customerAddress}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            customerAddress: e.target.value,
                          })
                        }
                        className={`w-full resize-none rounded-lg border px-4 py-3 transition-colors ${
                          errors.customerAddress
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter complete pickup address"
                      />
                      {errors.customerAddress && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerAddress}
                        </p>
                      )}
                      {!user.address && (
                        <div className="mt-2 flex items-center space-x-2 text-sm text-amber-600">
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
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span>
                            Consider updating your profile address for future
                            orders
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate("/customer/profile")}
                            className="text-blue-600 underline hover:text-blue-700"
                          >
                            Update Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pickup Date & Time */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      className={`w-full rounded-lg border px-4 py-3 transition-colors ${
                        errors.pickupDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      value={orderForm.pickupDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          pickupDate: e.target.value,
                        })
                      }
                    />
                    {errors.pickupDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.pickupDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Pickup Time *
                    </label>
                    <select
                      className={`w-full rounded-lg border px-4 py-3 transition-colors ${
                        errors.pickupTime
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      value={orderForm.pickupTime}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          pickupTime: e.target.value,
                        })
                      }
                    >
                      <option value="">Select time slot</option>
                      <option value="9-11">9:00 AM - 11:00 AM</option>
                      <option value="11-13">11:00 AM - 1:00 PM</option>
                      <option value="14-16">2:00 PM - 4:00 PM</option>
                      <option value="16-18">4:00 PM - 6:00 PM</option>
                    </select>
                    {errors.pickupTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.pickupTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Any special care instructions for your clothes..."
                    value={orderForm.instructions}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        instructions: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate("/customer/dashboard")}
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:shadow-lg"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedServices.length === 0 || submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        <span>Placing Order...</span>
                      </div>
                    ) : (
                      `Place Order - ৳${getOrderTotal().toFixed(0)}`
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="animate-in slide-in-from-right fixed right-4 top-4 z-50 duration-300">
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

export default NewOrder;

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
    pickupDate: '',
    pickupTime: '',
    instructions: '',
  });

  const [errors, setErrors] = useState({});

  // Handle reorder data from location state
  useEffect(() => {
    if (location.state?.reorderData) {
      const { services: reorderServices, instructions } = location.state.reorderData;
      
      // Pre-fill instructions
      setOrderForm(prev => ({
        ...prev,
        instructions: instructions || ''
      }));

      // Pre-select services when services are loaded
      if (services.length > 0 && reorderServices) {
        const preSelectedServices = reorderServices.map(reorderService => {
          const matchingService = services.find(s => s.name === reorderService.name);
          if (matchingService) {
            return {
              ...matchingService,
              quantity: parseFloat(reorderService.quantity.split(' ')[0]) || 1,
              total: matchingService.price * (parseFloat(reorderService.quantity.split(' ')[0]) || 1)
            };
          }
          return null;
        }).filter(Boolean);
        
        setSelectedServices(preSelectedServices);
      }
    }
  }, [location.state, services]);

  const handleServiceSelection = (service, quantity) => {
    const existingIndex = selectedServices.findIndex(s => s.id === service.id);
    
    if (quantity === 0 || quantity === '') {
      // Remove service
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else if (existingIndex >= 0) {
      // Update existing service
      const updated = [...selectedServices];
      updated[existingIndex] = { 
        ...service, 
        quantity: parseFloat(quantity), 
        total: service.price * parseFloat(quantity) 
      };
      setSelectedServices(updated);
    } else {
      // Add new service
      setSelectedServices([
        ...selectedServices, 
        { 
          ...service, 
          quantity: parseFloat(quantity), 
          total: service.price * parseFloat(quantity) 
        }
      ]);
    }
  };

  // New function to handle increment/decrement
  const adjustQuantity = (service, increment) => {
    const currentQuantity = getServiceQuantity(service.id) || 0;
    const step = service.type === 'weight' ? 0.5 : 1;
    const newQuantity = Math.max(0, currentQuantity + (increment ? step : -step));
    handleServiceSelection(service, newQuantity);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Updated handleOrderSubmit - use user data from localStorage/token
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const orderData = {
      // Use authenticated user's data
      customerName: user.name,
      phone: user.phone,
      address: user.address,
      pickupDate: orderForm.pickupDate,
      pickupTime: orderForm.pickupTime,
      instructions: orderForm.instructions,
      services: selectedServices,
      total: getOrderTotal()
    };

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Order placed successfully! Order ID: ${data.data.orderId}`);
        navigate("/customer/orders");
      } else {
        alert('Failed to place order: ' + data.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceQuantity = (serviceId) => {
    const service = selectedServices.find(s => s.id === serviceId);
    return service ? service.quantity : '';
  };

  // Add useEffect to fetch services
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
        console.error('Failed to fetch services:', data.message);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add loading state to render
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate("/customer/dashboard")}
                className="btn btn-ghost btn-circle"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-indigo-700">New Order</h1>
            </div>
            <span className="text-sm text-gray-500">LaundryOla</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Service Selection */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">Select Services</h2>
              {errors.services && (
                <div className="alert alert-error mb-4">
                  <span>{errors.services}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg text-gray-800">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-indigo-600">
                          ৳{service.price} {service.unit}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {service.duration}
                        </span>
                      </div>
                    </div>
                    
                    {/* Fixed: Added form-control wrapper and proper label positioning */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">
                          {service.type === 'weight' ? 'Weight (kg)' : 'Quantity'}
                        </span>
                      </label>
                      
                      {/* Input controls row - under the label */}
                      <div className="flex items-center space-x-2">
                        {/* Input Field */}
                        <input
                          type="number"
                          min="0"
                          step={service.type === 'weight' ? '0.5' : '1'}
                          className="input input-bordered input-sm w-20 text-center"
                          placeholder="0"
                          value={getServiceQuantity(service.id)}
                          onChange={(e) => handleServiceSelection(service, e.target.value)}
                        />

                        {/* Red Minus Button */}
                        <button
                          type="button"
                          onClick={() => adjustQuantity(service, false)}
                          className="btn btn-sm btn-circle btn-error"
                          disabled={!getServiceQuantity(service.id) || getServiceQuantity(service.id) <= 0}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>

                        {/* Green Plus Button */}
                        <button
                          type="button"
                          onClick={() => adjustQuantity(service, true)}
                          className="btn btn-sm btn-circle btn-success"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Services Summary */}
          {selectedServices.length > 0 && (
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {selectedServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({service.quantity} {service.unit.replace('per ', '')})
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800">৳{service.total.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total Amount:</span>
                    <span className="text-indigo-600">৳{getOrderTotal().toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pickup Details Form - Simplified */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">Pickup Details</h2>
              
              <form onSubmit={handleOrderSubmit} className="space-y-6">
                {/* Customer Info Display (Read-only) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">Order for:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {user.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {user.phone || 'N/A'}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Address:</span> {user.address || 'Please update your address in profile'}
                    </div>
                  </div>
                  {!user.address && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => navigate("/customer/profile")}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        Update Address in Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Pickup Date & Time */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text font-medium">Pickup Date *</span>
                    </label>
                    <input 
                      type="date" 
                      className={`input input-bordered ${errors.pickupDate ? 'input-error' : ''}`}
                      value={orderForm.pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setOrderForm({...orderForm, pickupDate: e.target.value})}
                    />
                    {errors.pickupDate && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.pickupDate}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text font-medium">Pickup Time *</span>
                    </label>
                    <select 
                      className={`select select-bordered ${errors.pickupTime ? 'select-error' : ''}`}
                      value={orderForm.pickupTime}
                      onChange={(e) => setOrderForm({...orderForm, pickupTime: e.target.value})}
                    >
                      <option value="">Select time slot</option>
                      <option value="9-11">9:00 AM - 11:00 AM</option>
                      <option value="11-13">11:00 AM - 1:00 PM</option>
                      <option value="14-16">2:00 PM - 4:00 PM</option>
                      <option value="16-18">4:00 PM - 6:00 PM</option>
                    </select>
                    {errors.pickupTime && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.pickupTime}</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text font-medium">Special Instructions (Optional)</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered h-20"
                    placeholder="Any special care instructions for your clothes"
       
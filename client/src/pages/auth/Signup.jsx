import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../../config/api.js";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "",
    email: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: form.name,
      phone: form.phone,
      role: form.role,
      email: form.email,
      password: form.password,
    };

    if (form.role === "customer") {
      payload.address = form.address;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        const role = data.data.user.role;

        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "delivery") navigate("/delivery/dashboard");
        else navigate("/customer/dashboard");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: "customer",
      label: "Customer",
      description: "Order laundry services",
      icon: "👤",
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "delivery",
      label: "Delivery Agent",
      description: "Pickup & delivery tasks",
      icon: "🚚",
      color: "from-green-500 to-green-600",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Manage the system",
      icon: "⚙️",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-purple-300 opacity-10 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-2xl">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Link
            to="/"
            className="group inline-flex items-center space-x-2 text-gray-600 transition-colors hover:text-blue-600"
          >
            <svg
              className="h-5 w-5 transform transition-transform group-hover:-translate-x-1"
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
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg md:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-6 flex items-center justify-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                <svg
                  className="h-7 w-7 text-white"
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
              <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                LaundryOla
              </h1>
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Join LaundryOla Today! 🚀
            </h2>
            <p className="text-lg text-gray-600">
              Create your account and start your laundry journey
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="h-5 w-5 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="font-medium text-red-700">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name & Phone Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Name Field */}
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
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  value={form.name}
                  required
                  onChange={handleChange}
                />
              </div>

              {/* Phone Field */}
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
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+8801XXXXXXXXX"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  value={form.phone}
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>I want to join as</span>
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                {roleOptions.map((role) => (
                  <label key={role.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={form.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                      required
                    />
                    <div
                      className={`rounded-xl border-2 p-4 transition-all duration-300 ${
                        form.role === role.value
                          ? `border-blue-500 bg-blue-50 shadow-md`
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 bg-gradient-to-r ${role.color} mx-auto mb-3 flex items-center justify-center rounded-lg text-xl`}
                      >
                        {role.icon}
                      </div>
                      <h3 className="mb-1 text-center font-semibold text-gray-900">
                        {role.label}
                      </h3>
                      <p className="text-center text-sm text-gray-600">
                        {role.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Address Field - Only for customers */}
            {form.role === "customer" && (
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Address</span>
                </label>
                <textarea
                  name="address"
                  placeholder="Your complete address (House/Flat, Road, Area, City)"
                  className="h-20 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  value={form.address}
                  required={form.role === "customer"}
                  onChange={handleChange}
                />
                <p className="flex items-center space-x-1 text-xs text-gray-500">
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
                  <span>This address will be used for pickup and delivery</span>
                </p>
              </div>
            )}

            {/* Email & Password Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email Field */}
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  value={form.email}
                  required
                  onChange={handleChange}
                />
              </div>

              {/* Password Field */}
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Choose a strong password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  value={form.password}
                  required
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full transform items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="px-4 font-medium text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="mb-4 text-gray-600">Already have an account?</p>
            <Link
              to="/signin"
              className="group inline-flex items-center space-x-2 font-semibold text-blue-600 transition-colors hover:text-indigo-600"
            >
              <span>Sign in to your account</span>
              <svg
                className="h-4 w-4 transform transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span>Free to Join</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

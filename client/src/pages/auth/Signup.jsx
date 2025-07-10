import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Create Your Account
        </h2>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Name */}
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Name
              </span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              className="input input-bordered w-full"
              value={form.name}
              required
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Phone
              </span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+8801XXXXXXXXX"
              className="input input-bordered w-full"
              value={form.phone}
              required
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Role
              </span>
            </label>
            <select
              name="role"
              className="select select-bordered w-full"
              value={form.role}
              required
              onChange={handleChange}
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="customer">Customer</option>
              <option value="delivery">Delivery Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Email */}
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Email
              </span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="input input-bordered w-full"
              value={form.email}
              required
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Password
              </span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              value={form.password}
              required
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary mt-3 w-full">
            Signup
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/signin" className="text-indigo-600 hover:underline">
            Signin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Add these imports

const Signup = () => {
  const navigate = useNavigate(); // Add this
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    console.log({ name, phone, role, email, password });

    // Route based on selected role
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "delivery") {
      navigate("/delivery/dashboard");
    } else {
      navigate("/customer/dashboard");
    }
  };

  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Create Your Account
        </h2>
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
              placeholder="Your full name"
              className="input input-bordered w-full"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
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
              placeholder="+8801XXXXXXXXX"
              className="input input-bordered w-full"
              value={phone}
              required
              onChange={(e) => setPhone(e.target.value)}
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
              className="select select-bordered w-full"
              value={role}
              required
              onChange={(e) => setRole(e.target.value)}
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
              placeholder="you@example.com"
              className="input input-bordered w-full"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="••••••••"
              className="input input-bordered w-full"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
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

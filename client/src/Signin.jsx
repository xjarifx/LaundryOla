import React, { useState } from "react";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in:", { email, password });
    // TODO: backend API call
  };

  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Login to Laundry Service
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Email
              </span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                Password
              </span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <a
              href="/forgot-password"
              className="mt-1 self-end text-sm text-indigo-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Signin
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-indigo-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signin;

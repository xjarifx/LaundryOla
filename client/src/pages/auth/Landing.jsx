import React from "react";
import { Link } from "react-router-dom"; // Add this import

const LandingPage = () => {
  return (
    <div data-theme="light" className="bg-base-200 flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-base-100 p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <h1 className="text-2xl font-extrabold tracking-wide text-indigo-700">
            LaundryOla
          </h1>
          <nav className="ml-auto flex space-x-4">
            <Link
              to="/signin"
              className="btn btn-ghost btn-sm text-indigo-600 hover:bg-indigo-100"
            >
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex max-w-4xl flex-grow flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="mb-6 text-5xl leading-tight font-extrabold text-gray-900">
          Your Clothes, Our Care — Fast, Reliable Laundry Service
        </h2>
        <p className="mb-10 max-w-xl text-lg text-gray-700">
          Schedule easy pickups, track your laundry in real-time, and get
          doorstep delivery. LaundryOla makes laundry day effortless and
          hassle-free.
        </p>
        <div className="flex flex-col justify-center gap-6 sm:flex-row">
          <Link
            to="/signup"
            className="btn btn-primary btn-lg px-12 py-4 font-semibold"
          >
            Get Started Now
          </Link>
          <Link
            to="/signin"
            className="btn btn-outline btn-lg px-12 py-4 font-semibold text-indigo-600"
          >
            Already a User? Sign In
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-base-100 py-6 text-center text-sm text-gray-500">
        &copy; 2025 LaundryOla. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;

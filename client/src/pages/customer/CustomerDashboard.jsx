import React from "react";
import { useNavigate } from "react-router-dom";
import { mockUser } from "../../data/services";
import profileIcon from "/profileIcon.png"; // Add this import

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/");
  };

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-700">LaundryOla</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{mockUser.name}</p>
                <p className="text-sm text-gray-500">{mockUser.email}</p>
              </div>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  {/* Replace text-based avatar with image */}
                  <div className="w-10 h-10 rounded-full bg-indigo-100 p-1">
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <a onClick={() => navigate("/customer/profile")}>Profile</a>
                  </li>
                  <li>
                    <a onClick={handleLogout}>Logout</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Action Buttons - 2-column grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <button
            onClick={() => navigate("/customer/new-order")}
            className="btn btn-primary btn-lg h-32 flex-col py-8 text-lg"
          >
            <svg
              className="mb-3 h-12 w-12"
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
            New Order
          </button>

          <button
            onClick={() => navigate("/customer/orders")}
            className="btn btn-outline btn-lg h-32 flex-col py-8 text-lg"
          >
            <svg
              className="mb-3 h-12 w-12"
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
            My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

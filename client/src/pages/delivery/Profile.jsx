import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profileIcon from "/profileIcon.png";
import API_BASE_URL from "../../config/api.js";

const DeliveryProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user.name || "Delivery Agent",
    email: user.email || "agent@laundryola.com",
    phone: user.phone || "+8801234567890",
    agentId: user.agentId || "DA001",
    vehicleType: user.vehicleType || "Motorcycle",
    licenseNumber: user.licenseNumber || "DH-1234567890",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditProfile = () => setIsEditingProfile(true);

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      name: user.name || "Delivery Agent",
      email: user.email || "agent@laundryola.com",
      phone: user.phone || "+8801234567890",
      agentId: user.agentId || "DA001",
      vehicleType: user.vehicleType || "Motorcycle",
      licenseNumber: user.licenseNumber || "DH-1234567890",
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          agentId: profileData.agentId,
          vehicleType: profileData.vehicleType,
          licenseNumber: profileData.licenseNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditingProfile(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleChangePassword = () => setIsChangingPassword(true);

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        alert("Password changed successfully!");
      } else {
        alert("Failed to change password: " + data.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your delivery agent account? This action cannot be undone.",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/auth/delete-account`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (data.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert("Account deleted successfully");
          navigate("/");
        } else {
          alert("Failed to delete account: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Error deleting account. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-green-300 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-300 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-teal-300 opacity-10 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/delivery/dashboard")}
                className="group rounded-xl p-2 transition-colors hover:bg-green-100"
              >
                <svg
                  className="h-6 w-6 transform text-gray-600 transition-all group-hover:-translate-x-1 group-hover:text-green-600"
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h1 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-2xl font-bold text-transparent">
                  My Profile
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
                Delivery Agent
              </span>
              <span className="text-sm font-medium text-gray-700">
                LaundryOla
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">
          {/* Profile Overview Card */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col items-center space-y-6 md:flex-row md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 p-4 shadow-lg">
                  <img
                    src={profileIcon}
                    alt="Delivery Agent Profile"
                    className="h-full w-full object-contain drop-shadow-sm filter"
                  />
                </div>
                <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  {profileData.name}
                </h2>
                <p className="mb-1 text-lg text-gray-600">
                  {profileData.email}
                </p>
                <p className="mb-4 text-gray-500">{profileData.phone}</p>

                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  <span className="flex items-center space-x-1 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                    <span>🚚</span>
                    <span>Delivery Agent</span>
                  </span>
                  <span className="flex items-center space-x-1 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
                    <span>⚡</span>
                    <span>Active</span>
                  </span>
                  <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-800">
                    ID: {profileData.agentId}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <div className="text-2xl font-bold text-green-600">48</div>
                  <div className="text-xs text-green-700">Deliveries</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="text-2xl font-bold text-blue-600">4.9★</div>
                  <div className="text-xs text-blue-700">Rating</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                  <div className="text-2xl font-bold text-orange-600">6</div>
                  <div className="text-xs text-orange-700">Months</div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Personal Information
                </h3>
              </div>

              {!isEditingProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/25"
                  disabled={loading}
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelProfileEdit}
                    className="rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Full Name */}
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
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      value={profileData.name}
                      onChange={(e) =>
                        handleProfileInputChange("name", e.target.value)
                      }
                      required
                    />
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {profileData.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email */}
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
                  {isEditingProfile ? (
                    <input
                      type="email"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileInputChange("email", e.target.value)
                      }
                      required
                    />
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {profileData.email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Phone */}
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
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileInputChange("phone", e.target.value)
                      }
                      required
                    />
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {profileData.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Agent ID */}
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
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <span>Agent ID</span>
                  </label>
                  <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3">
                    <span className="font-bold text-orange-900">
                      {profileData.agentId}
                    </span>
                    <span className="ml-2 text-xs text-orange-600">
                      (Read-only)
                    </span>
                  </div>
                </div>

                {/* Vehicle Type */}
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Vehicle Type</span>
                  </label>
                  {isEditingProfile ? (
                    <select
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      value={profileData.vehicleType}
                      onChange={(e) =>
                        handleProfileInputChange("vehicleType", e.target.value)
                      }
                      required
                    >
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                    </select>
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {profileData.vehicleType}
                      </span>
                    </div>
                  )}
                </div>

                {/* License Number */}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>License Number</span>
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      value={profileData.licenseNumber}
                      onChange={(e) =>
                        handleProfileInputChange(
                          "licenseNumber",
                          e.target.value,
                        )
                      }
                      placeholder="Enter driving license number"
                      required
                    />
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {profileData.licenseNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Security Section */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-pink-500">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Security Settings
                </h3>
              </div>

              {!isChangingPassword ? (
                <button
                  onClick={handleChangePassword}
                  className="flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25"
                  disabled={loading}
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Change Password</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelPasswordChange}
                    className="rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePassword}
                    className="flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handleSavePassword} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Current Password */}
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Current Password *</span>
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "currentPassword",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>

                  {/* New Password */}
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
                      <span>New Password *</span>
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordInputChange("newPassword", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Confirm Password */}
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Confirm Password *</span>
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-300 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "confirmPassword",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-gray-600">
                  <svg
                    className="h-4 w-4 text-green-600"
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
                  <span>
                    Password must be at least 6 characters long and contain a
                    mix of letters and numbers for better security.
                  </span>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">
                  Your Account is Secure
                </h4>
                <p className="text-gray-600">
                  Click "Change Password" to update your account security
                  credentials.
                </p>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-gray-600 to-gray-700">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Account Actions
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex transform items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/25"
              >
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>

              {/* Delete Account Button */}
              <button
                onClick={handleDeleteAccount}
                className="flex transform items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 p-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/25"
                disabled={loading}
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Delete Account</span>
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h4 className="mb-1 font-semibold text-amber-800">
                    Account Deletion Warning
                  </h4>
                  <p className="text-sm text-amber-700">
                    Deleting your delivery agent account is permanent and cannot
                    be undone. All your delivery history and profile data will
                    be removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;

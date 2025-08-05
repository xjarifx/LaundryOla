import React, { useState } from "react";
import profileIcon from "/profileIcon.png";
import API_BASE_URL from "../config/api.js";
import { useNavigate } from "react-router-dom";

const ProfileBase = ({
  user,
  fields,
  readOnlyFields = [],
  labels = {},
  roleLabel = "User",
  dashboardPath = "/",
  profileTitle = "Profile",
  quickStats = null,
  deletionWarning = null,
  extraFields = null,
  bgGradient = "from-slate-50 via-blue-50 to-indigo-100",
  headerGradient = "from-blue-600 to-indigo-600",
  avatarBg = "from-blue-100 to-indigo-100",
  roleColor = "bg-blue-100 text-blue-800",
  idColor = "bg-purple-100 text-purple-800",
}) => {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Build initial profileData from fields
  const initialProfileData = {};
  
  // Debug logging for user object
  console.log("User object:", user);
  console.log("Fields to display:", fields);
  console.log("Read-only fields:", readOnlyFields);
  
  // Check if ID fields exist in user object
  if (user.customerId) console.log("customerId exists:", user.customerId);
  if (user.employeeId) console.log("employeeId exists:", user.employeeId);
  if (user.agentId) console.log("agentId exists:", user.agentId);
  
  // Also check snake_case versions
  if (user.customer_id) console.log("customer_id exists:", user.customer_id);
  if (user.employee_id) console.log("employee_id exists:", user.employee_id);
  if (user.agent_id) console.log("agent_id exists:", user.agent_id);
  
  fields.forEach((field) => {
    // For ID fields, check both camelCase and snake_case versions
    if (field === 'customerId' && !user[field] && user.customer_id) {
      initialProfileData[field] = user.customer_id;
    } else if (field === 'employeeId' && !user[field] && user.employee_id) {
      initialProfileData[field] = user.employee_id;
    } else if (field === 'agentId' && !user[field] && user.agent_id) {
      initialProfileData[field] = user.agent_id;
    } else {
      initialProfileData[field] = user[field] || "";
    }
    console.log(`Setting field ${field} to value: ${initialProfileData[field]}`);
  });
  
  console.log("Initial profile data:", initialProfileData);
  
  const [profileData, setProfileData] = useState(initialProfileData);

  // Use useEffect to re-initialize profileData when user object changes
  // This is crucial for when the user data is updated after a network request
  React.useEffect(() => {
    const newInitialData = {};
    fields.forEach((field) => {
      // Prioritize camelCase, fallback to snake_case
      if (user[field]) {
        newInitialData[field] = user[field];
      } else if (field === 'customerId' && user.customer_id) {
        newInitialData[field] = user.customer_id;
      } else if (field === 'employeeId' && user.employee_id) {
        newInitialData[field] = user.employee_id;
      } else if (field === 'agentId' && user.agent_id) {
        newInitialData[field] = user.agent_id;
      } else {
        newInitialData[field] = user[field] || "";
      }
    });
    setProfileData(newInitialData);
  }, [user, fields]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditProfile = () => setIsEditingProfile(true);
  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileData(initialProfileData);
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
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (data.success) {
        // Use the complete user object returned from the server
        // This ensures we have all fields including IDs
        const updatedUser = data.data;
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
        "Are you sure you want to delete your account? This action cannot be undone.",
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
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* You can customize background blobs per role if needed */}
      </div>
      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(dashboardPath)}
                className="group rounded-xl p-2 transition-colors hover:bg-blue-100"
              >
                <svg
                  className="h-6 w-6 transform text-gray-600 transition-all group-hover:-translate-x-1 group-hover:text-blue-600"
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
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r ${headerGradient}`}
                >
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
                <h1
                  className={`bg-gradient-to-r ${headerGradient} bg-clip-text text-2xl font-bold text-transparent`}
                >
                  {profileTitle}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500`}
              >
                {roleLabel}
              </span>
              <span className="text-sm font-medium text-gray-700">
                LaundryOla
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="container relative z-10 mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">
          {/* Profile Overview Card */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col items-center space-y-6 md:flex-row md:space-x-8 md:space-y-0">
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`h-24 w-24 rounded-3xl bg-gradient-to-br ${avatarBg} p-4 shadow-lg`}
                >
                  <img
                    src={profileIcon}
                    alt="Profile"
                    className="h-full w-full object-contain drop-shadow-sm filter"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500">
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
                  <span
                    className={`flex items-center space-x-1 rounded-full ${roleColor} px-4 py-2 text-sm font-semibold`}
                  >
                    <span>{roleLabel}</span>
                  </span>
                  {readOnlyFields.map((field) => {
                    const fieldLabel = labels[field] || field;
                    const fieldValue = profileData[field];
                    console.log(`Rendering ID field: ${field}, value: ${fieldValue}`);
                    return (
                      <span
                        key={field}
                        className={`rounded-full ${idColor} px-4 py-2 text-sm font-semibold`}
                      >
                        {fieldLabel}: {fieldValue || 'Not available'}
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* Quick Stats (optional) */}
              {quickStats && <div>{quickStats}</div>}
            </div>
          </div>
          {/* Personal Information Card */}
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${headerGradient}`}
                >
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
                  className={`flex transform items-center space-x-2 rounded-xl bg-gradient-to-r ${headerGradient} px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
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
                    className="flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/25"
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
                {fields.map((field) =>
                  readOnlyFields.includes(field) ? (
                    <div key={field} className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <span>{labels[field] || field}</span>
                      </label>
                      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {profileData[field]}
                        </span>
                        <span className="ml-2 text-xs text-gray-600">
                          (Read-only)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={field} className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <span>{labels[field] || field}</span>
                      </label>
                      {isEditingProfile ? (
                        <input
                          type={
                            field.toLowerCase().includes("email")
                              ? "email"
                              : "text"
                          }
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          value={profileData[field]}
                          onChange={(e) =>
                            handleProfileInputChange(field, e.target.value)
                          }
                          required
                        />
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                          <span className="font-medium text-gray-900">
                            {profileData[field]}
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                )}
                {extraFields &&
                  extraFields({
                    isEditingProfile,
                    profileData,
                    handleProfileInputChange,
                  })}
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
                    className="flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/25"
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
                      <span>Current Password *</span>
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
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
                      <span>New Password *</span>
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
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
                      <span>Confirm Password *</span>
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
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
                <div className="flex items-center space-x-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-gray-600">
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
              <button
                onClick={handleLogout}
                className="flex transform items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25"
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
            {deletionWarning && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                {deletionWarning}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBase;

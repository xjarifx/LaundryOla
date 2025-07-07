import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profileIcon from "../../../public/profileIcon.png"; // Add this import

const Profile = ({ userType = "customer" }) => {
  const navigate = useNavigate();

  // Mock data that would come from backend based on user type
  const getUserData = (type) => {
    switch (type) {
      case "admin":
        return {
          name: "Admin User",
          email: "admin@laundryola.com",
          phone: "+8801234567890",
          role: "Administrator",
          emergencyContact: "+8801987654321",
          address: "LaundryOla Head Office, Dhaka",
          badge: "Administrator",
          badgeColor: "badge-primary",
          dashboardRoute: "/admin/dashboard",
          profileRoute: "/admin/profile",
          additionalFields: {
            employeeId: "ADM001",
            department: "Operations",
            joinDate: "2024-01-15",
          },
        };
      case "delivery":
        return {
          name: "Delivery Agent",
          email: "agent@laundryola.com",
          phone: "+8801234567890",
          role: "Delivery Agent",
          emergencyContact: "+8801987654321",
          address: "Gulshan, Dhaka",
          badge: "Delivery Agent",
          badgeColor: "badge-secondary",
          dashboardRoute: "/delivery/dashboard",
          profileRoute: "/delivery/profile",
          additionalFields: {
            agentId: "DA001",
            vehicleNumber: "DHK-1234",
            licenseNumber: "DL123456789",
          },
        };
      default: // customer
        return {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+8801234567890",
          role: "Customer",
          emergencyContact: "+8801987654321",
          address: "House 123, Road 45, Dhanmondi, Dhaka",
          badge: "Customer",
          badgeColor: "badge-outline",
          dashboardRoute: "/customer/dashboard",
          profileRoute: "/customer/profile",
          additionalFields: {
            customerId: "CUST001",
            memberSince: "2024-06-15",
            totalOrders: 23,
          },
        };
    }
  };

  const userData = getUserData(userType);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    address: userData.address,
    ...userData.additionalFields,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditProfile = () => setIsEditingProfile(true);
  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    // Reset to original data
    setProfileData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      ...userData.additionalFields,
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    console.log("Saving profile:", profileData);
    // TODO: API call to save profile
    setIsEditingProfile(false);
    alert("Profile updated successfully!");
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

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    console.log("Changing password for:", userData.email);
    // TODO: API call to change password
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    alert("Password changed successfully!");
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleLogout = () => {
    console.log(`${userData.role} logging out...`);
    navigate("/");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        `Are you sure you want to delete your ${userData.role.toLowerCase()} account? This action cannot be undone.`,
      )
    ) {
      console.log(`Deleting ${userData.role.toLowerCase()} account...`);
      // TODO: API call to delete account
      alert(`${userData.role} account deleted successfully`);
      navigate("/");
    }
  };

  // Render additional fields based on user type
  const renderAdditionalFields = () => {
    if (userType === "admin") {
      return (
        <>
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">Employee ID</span>
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                className="input input-bordered"
                value={profileData.employeeId}
                onChange={(e) =>
                  handleProfileInputChange("employeeId", e.target.value)
                }
              />
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3">
                {profileData.employeeId}
              </p>
            )}
          </div>

          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">Department</span>
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                className="input input-bordered"
                value={profileData.department}
                onChange={(e) =>
                  handleProfileInputChange("department", e.target.value)
                }
              />
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3">
                {profileData.department}
              </p>
            )}
          </div>
        </>
      );
    }

    if (userType === "delivery") {
      return (
        <>
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">Agent ID</span>
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                className="input input-bordered"
                value={profileData.agentId}
                onChange={(e) =>
                  handleProfileInputChange("agentId", e.target.value)
                }
              />
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3">
                {profileData.agentId}
              </p>
            )}
          </div>

          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">Vehicle Number</span>
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                className="input input-bordered"
                value={profileData.vehicleNumber}
                onChange={(e) =>
                  handleProfileInputChange("vehicleNumber", e.target.value)
                }
              />
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3">
                {profileData.vehicleNumber}
              </p>
            )}
          </div>

          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">License Number</span>
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                className="input input-bordered"
                value={profileData.licenseNumber}
                onChange={(e) =>
                  handleProfileInputChange("licenseNumber", e.target.value)
                }
              />
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3">
                {profileData.licenseNumber}
              </p>
            )}
          </div>
        </>
      );
    }

    if (userType === "customer") {
      return (
        <>
          <div className="form-control flex flex-col">
            <label className="label">
              <span className="label-text font-medium">Customer ID</span>
            </label>
            <p className="rounded-lg bg-gray-50 px-4 py-3">
              {profileData.customerId}
            </p>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(userData.dashboardRoute)}
                className="btn btn-ghost btn-circle"
              >
                <svg
                  className="h-6 w-6"
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
              <h1 className="text-2xl font-bold text-indigo-700">My Profile</h1>
            </div>
            <span className="text-sm text-gray-500">LaundryOla</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                <div className="avatar">
                  {/* Replace text-based avatar with image */}
                  <div className="h-24 w-24 rounded-full bg-indigo-100 p-2">
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {profileData.name}
                  </h2>
                  <p className="text-gray-600">{profileData.email}</p>
                  <p className="text-gray-600">{profileData.phone}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
                    <span className={`badge ${userData.badgeColor}`}>
                      {userData.badge}
                    </span>
                    <span className="badge badge-outline">Active Member</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="card-title text-xl">Personal Information</h3>
                {!isEditingProfile ? (
                  <button
                    onClick={handleEditProfile}
                    className="btn btn-primary btn-sm"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
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
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleCancelProfileEdit}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-success btn-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Common Fields */}
                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text font-medium">Full Name</span>
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        className="input input-bordered"
                        value={profileData.name}
                        onChange={(e) =>
                          handleProfileInputChange("name", e.target.value)
                        }
                      />
                    ) : (
                      <p className="rounded-lg bg-gray-50 px-4 py-3">
                        {profileData.name}
                      </p>
                    )}
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text font-medium">
                        Email Address
                      </span>
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        className="input input-bordered"
                        value={profileData.email}
                        onChange={(e) =>
                          handleProfileInputChange("email", e.target.value)
                        }
                      />
                    ) : (
                      <p className="rounded-lg bg-gray-50 px-4 py-3">
                        {profileData.email}
                      </p>
                    )}
                  </div>

                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text font-medium">
                        Phone Number
                      </span>
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        className="input input-bordered"
                        value={profileData.phone}
                        onChange={(e) =>
                          handleProfileInputChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      <p className="rounded-lg bg-gray-50 px-4 py-3">
                        {profileData.phone}
                      </p>
                    )}
                  </div>

                  {/* Role-specific Fields */}
                  {renderAdditionalFields()}
                </div>

                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text font-medium">Address</span>
                  </label>
                  {isEditingProfile ? (
                    <textarea
                      className="textarea textarea-bordered h-24"
                      value={profileData.address}
                      onChange={(e) =>
                        handleProfileInputChange("address", e.target.value)
                      }
                    />
                  ) : (
                    <p className="rounded-lg bg-gray-50 px-4 py-3">
                      {profileData.address}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="card-title text-xl">Change Password</h3>
                {!isChangingPassword ? (
                  <button
                    onClick={handleChangePassword}
                    className="btn btn-outline btn-sm"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
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
                    Change Password
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleCancelPasswordChange}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePassword}
                      className="btn btn-success btn-sm"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              {isChangingPassword && (
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="form-control flex flex-col">
                      <label className="label">
                        <span className="label-text font-medium">
                          Current Password *
                        </span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordInputChange(
                            "currentPassword",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="form-control flex flex-col">
                      <label className="label">
                        <span className="label-text font-medium">
                          New Password *
                        </span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordInputChange(
                            "newPassword",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="form-control flex flex-col">
                      <label className="label">
                        <span className="label-text font-medium">
                          Confirm Password *
                        </span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordInputChange(
                            "confirmPassword",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Password must be at least 6 characters long
                  </div>
                </form>
              )}

              {!isChangingPassword && (
                <p className="text-gray-600">
                  Click "Change Password" to update your account password
                </p>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-6 text-xl">Account Actions</h3>

              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full justify-start"
                >
                  <svg
                    className="mr-3 h-5 w-5"
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
                  Logout
                </button>

                <div className="divider"></div>

                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-error btn-outline w-full justify-start"
                >
                  <svg
                    className="mr-3 h-5 w-5"
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
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

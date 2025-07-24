import React from "react";
import ProfileBase from "../../components/ProfileBase.jsx";

const DeliveryProfile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Custom quick stats and deletion warning for delivery agent
  const quickStats = (
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
  );
  const deletionWarning = (
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
          Deleting your delivery agent account is permanent and cannot be
          undone. All your delivery history and profile data will be removed.
        </p>
      </div>
    </div>
  );

  // Extra fields for delivery agent (vehicleType, licenseNumber)
  const extraFields = ({
    isEditingProfile,
    profileData,
    handleProfileInputChange,
  }) => (
    <>
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
          <span>Vehicle Type</span>
        </label>
        {isEditingProfile ? (
          <select
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
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
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
          <span>License Number</span>
        </label>
        {isEditingProfile ? (
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all duration-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
            value={profileData.licenseNumber}
            onChange={(e) =>
              handleProfileInputChange("licenseNumber", e.target.value)
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
    </>
  );

  return (
    <ProfileBase
      user={user}
      fields={[
        "name",
        "email",
        "phone",
        "agentId",
        "vehicleType",
        "licenseNumber",
      ]}
      readOnlyFields={["agentId"]}
      labels={{
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        agentId: "Agent ID",
        vehicleType: "Vehicle Type",
        licenseNumber: "License Number",
      }}
      roleLabel="Delivery Agent"
      dashboardPath="/delivery/dashboard"
      profileTitle="My Profile"
      quickStats={quickStats}
      deletionWarning={deletionWarning}
      extraFields={extraFields}
      bgGradient="from-slate-50 via-green-50 to-emerald-100"
      headerGradient="from-green-600 to-emerald-600"
      avatarBg="from-green-100 to-emerald-100"
      roleColor="bg-green-100 text-green-800"
      idColor="bg-orange-100 text-orange-800"
    />
  );
};

export default DeliveryProfile;

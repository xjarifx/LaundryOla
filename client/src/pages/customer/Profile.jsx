import React from "react";
import ProfileBase from "../../components/ProfileBase.jsx";

const CustomerProfile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Custom quick stats and deletion warning for customer
  const quickStats = (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="text-2xl font-bold text-blue-600">12</div>
        <div className="text-xs text-blue-700">Orders</div>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4">
        <div className="text-2xl font-bold text-green-600">98%</div>
        <div className="text-xs text-green-700">Satisfaction</div>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
        <div className="text-2xl font-bold text-purple-600">2</div>
        <div className="text-xs text-purple-700">Years</div>
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
          Deleting your account is permanent and cannot be undone. All your
          order history and personal data will be removed.
        </p>
      </div>
    </div>
  );

  return (
    <ProfileBase
      user={user}
      fields={["name", "email", "phone", "address", "customerId"]}
      readOnlyFields={["customerId"]}
      labels={{
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        address: "Address",
        customerId: "Customer ID",
      }}
      roleLabel="Customer"
      dashboardPath="/customer/dashboard"
      profileTitle="My Profile"
      quickStats={quickStats}
      deletionWarning={deletionWarning}
      bgGradient="from-slate-50 via-blue-50 to-indigo-100"
      headerGradient="from-blue-600 to-indigo-600"
      avatarBg="from-blue-100 to-indigo-100"
      roleColor="bg-blue-100 text-blue-800"
      idColor="bg-purple-100 text-purple-800"
    />
  );
};

export default CustomerProfile;

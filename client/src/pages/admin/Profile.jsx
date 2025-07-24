import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileBase from "../../components/ProfileBase.jsx";

const AdminProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Custom quick stats and deletion warning for admin
  const quickStats = (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
        <div className="text-2xl font-bold text-purple-600">156</div>
        <div className="text-xs text-purple-700">Total Orders</div>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
        <div className="text-2xl font-bold text-indigo-600">12</div>
        <div className="text-xs text-indigo-700">Users</div>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 p-4">
        <div className="text-2xl font-bold text-violet-600">3</div>
        <div className="text-xs text-violet-700">Years</div>
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
          ⚠️ Admin Account Deletion Warning
        </h4>
        <p className="text-sm text-amber-700">
          Deleting the admin account is <strong>extremely dangerous</strong> and
          will remove all administrative access to the system. This action
          cannot be undone and may affect system operations.
        </p>
      </div>
    </div>
  );

  return (
    <ProfileBase
      user={user}
      fields={["name", "email", "phone", "employeeId"]}
      readOnlyFields={["employeeId"]}
      labels={{
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        employeeId: "Employee ID",
      }}
      roleLabel="Administrator"
      dashboardPath="/admin/dashboard"
      profileTitle="Admin Profile"
      quickStats={quickStats}
      deletionWarning={deletionWarning}
      bgGradient="from-slate-50 via-purple-50 to-indigo-100"
      headerGradient="from-purple-600 to-indigo-600"
      avatarBg="from-purple-100 to-indigo-100"
      roleColor="bg-purple-100 text-purple-800"
      idColor="bg-indigo-100 text-indigo-800"
    />
  );
};

export default AdminProfile;

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../App";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // Check if user is authenticated
  if (!token || !storedUser) {
    return <Navigate to="/signin" replace />;
  }

  // Parse stored user if context user is null
  const currentUser = user || JSON.parse(storedUser);

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

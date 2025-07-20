// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token  = localStorage.getItem("token")
  console.log("token:", token);
  return token ? children : <Navigate to="/" />;
}

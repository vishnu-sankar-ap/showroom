import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Customer from "./pages/Customer.jsx";
import Admin from "./pages/Admin.jsx";
import { getAuth } from "./api.js";

function Protected({ role, children }) {
  const auth = getAuth();
  if (!auth.token) return <Navigate to="/" replace />;
  if (auth.role !== role) {
    return <Navigate to={auth.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Protected role="customer"><Customer /></Protected>} />
      <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
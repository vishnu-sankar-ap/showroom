import { useNavigate } from "react-router-dom";
import { clearAuth } from "../api.js";

export default function Navbar({ title }) {
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="brand">
        🏍️ Showroom <span>{title}</span>
      </div>
      <button className="btn ghost" onClick={logout}>Logout</button>
    </header>
  );
}
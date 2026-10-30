import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from "../api.js";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api("/api/auth/register", { method: "POST", body: form });
      }
      const res = await api("/api/auth/login", {
        method: "POST",
        body: { email: form.email, password: form.password },
      });
      setAuth(res.access_token, res.role);
      navigate(res.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>🏍️ Showroom</h1>
        <p className="muted">{mode === "login" ? "Sign in to your account" : "Create your account"}</p>

        {mode === "register" && (
          <>
            <input name="name" placeholder="Full name" value={form.name} onChange={change} required />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={change} />
            <input name="address" placeholder="Address" value={form.address} onChange={change} />
          </>
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} required />

        {error && <div className="error">{error}</div>}

        <button className="btn" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>

        <p className="muted switch">
          {mode === "login" ? "New customer? " : "Already registered? "}
          <a href="#" onClick={(e) => { e.preventDefault(); setError(""); setMode(mode === "login" ? "register" : "login"); }}>
            {mode === "login" ? "Create an account" : "Login"}
          </a>
        </p>
      </form>
    </div>
  );
}
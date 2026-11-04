import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from "../api.js";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
<div className="password-field">
  <input
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={form.password}
    onChange={change}
    required
  />
  <button
    type="button"
    className="eye-btn"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>
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
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { api } from "../api.js";
import { insuranceStatus } from "../utils.js";

const BIKES = ["Royal Enfield Classic 350", "Yamaha R15 V4", "KTM Duke 390", "Honda CB350", "Bajaj Pulsar NS200", "TVS Apache RTR 160"];

export default function Customer() {
  const [me, setMe] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [vehicle, setVehicle] = useState(BIKES[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setMe(await api("/api/auth/me"));
      setEnquiries(await api("/api/enquiries/mine"));
      setServices(await api("/api/services/mine"));
      setPolicies(await api("/api/insurance/mine"));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/enquiries", { method: "POST", body: { vehicle_name: vehicle, message } });
      setMessage("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar title="Customer Panel" />
      <main className="container">
        <h2>Welcome{me ? `, ${me.name}` : ""} 👋</h2>
        {me && (
          <div className="idcard">
            <span>Customer ID</span>
            <b>{me.customer_code}</b>
          </div>
        )}
        {error && <div className="error">{error}</div>}

        <div className="grid2">
          <section className="card">
            <h3>New enquiry</h3>
            <form onSubmit={submit}>
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                {BIKES.map((b) => <option key={b}>{b}</option>)}
              </select>
              <textarea placeholder="Your message (test ride, price, finance...)" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
              <button className="btn">Send enquiry</button>
            </form>
          </section>

          <section className="card">
            <h3>My enquiries</h3>
            {enquiries.length === 0 ? <p className="muted">No enquiries yet.</p> : (
              <table>
                <thead><tr><th>Bike</th><th>Status</th><th>Follow-up</th></tr></thead>
                <tbody>
                  {enquiries.map((q) => (
                    <tr key={q.id}>
                      <td>{q.vehicle_name}</td>
                      <td><span className={`badge ${q.status}`}>{q.status.replace("_", " ")}</span></td>
                      <td>{q.follow_up_date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <section className="card">
          <h3>My insurance</h3>
          {policies.length === 0 ? <p className="muted">No insurance policies on record.</p> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Vehicle</th><th>Reg no.</th><th>Provider</th><th>Policy no.</th><th>Valid till</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {policies.map((p) => {
                    const st = insuranceStatus(p.expiry_date);
                    return (
                      <tr key={p.id}>
                        <td>{p.vehicle_model}</td>
                        <td>{p.reg_number || "-"}</td>
                        <td>{p.provider}</td>
                        <td>{p.policy_number || "-"}</td>
                        <td>{p.expiry_date}</td>
                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h3>My service history</h3>
          {services.length === 0 ? <p className="muted">No service records yet.</p> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Vehicle</th><th>Reg no.</th><th>Date</th><th>Work done</th><th>Cost</th></tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td>{s.vehicle_model}</td>
                      <td>{s.reg_number || "-"}</td>
                      <td>{s.service_date || "-"}</td>
                      <td>{s.description || "-"}</td>
                      <td>{s.cost != null ? `₹${s.cost}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
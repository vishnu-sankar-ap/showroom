import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { api } from "../api.js";
import { insuranceStatus, toBody } from "../utils.js";

const STATUSES = ["new", "follow_up", "sold", "lost"];
const emptySvc = { customer_code: "", vehicle_model: "", reg_number: "", service_date: "", description: "", cost: "" };
const emptyIns = { customer_code: "", vehicle_model: "", reg_number: "", provider: "", policy_number: "", start_date: "", expiry_date: "", premium: "" };

function EnquiryRow({ enquiry, onSaved }) {
  const [status, setStatus] = useState(enquiry.status);
  const [date, setDate] = useState(enquiry.follow_up_date || "");
  const [notes, setNotes] = useState(enquiry.notes || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api(`/api/enquiries/${enquiry.id}`, {
        method: "PATCH",
        body: { status, follow_up_date: date || null, notes },
      });
      onSaved();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td><span className="code">{enquiry.customer_code}</span><div className="muted small">{enquiry.customer_name}</div></td>
      <td>{enquiry.vehicle_name}<div className="muted small">{enquiry.message}</div></td>
      <td>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </td>
      <td><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></td>
      <td><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" /></td>
      <td><button className="btn small" onClick={save} disabled={saving}>{saving ? "..." : "Save"}</button></td>
    </tr>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("sales");
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [svc, setSvc] = useState(emptySvc);
  const [ins, setIns] = useState(emptyIns);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setEnquiries(await api("/api/enquiries"));
      setCustomers(await api("/api/auth/customers"));
      setServices(await api("/api/services"));
      setPolicies(await api("/api/insurance"));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const changeSvc = (e) => setSvc({ ...svc, [e.target.name]: e.target.value });
  const changeIns = (e) => setIns({ ...ins, [e.target.name]: e.target.value });

  const addService = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/services", { method: "POST", body: toBody(svc, ["cost"]) });
      setSvc(emptySvc);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addPolicy = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/insurance", { method: "POST", body: toBody(ins, ["premium"]) });
      setIns(emptyIns);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const count = (s) => enquiries.filter((q) => q.status === s).length;
  const expiringSoon = policies.filter((p) => {
    const st = insuranceStatus(p.expiry_date).cls;
    return st === "follow_up" || st === "lost";
  }).length;

  const tabs = [["sales", "Sales"], ["customers", "Customers"], ["services", "Services"], ["insurance", "Insurance"]];

  return (
    <>
      <Navbar title="Admin Panel" />
      <main className="container">
        <div className="stats">
          <div className="card stat"><b>{customers.length}</b><span>Customers</span></div>
          <div className="card stat"><b>{enquiries.length}</b><span>Enquiries</span></div>
          <div className="card stat"><b>{count("follow_up")}</b><span>Follow-ups</span></div>
          <div className="card stat"><b>{count("sold")}</b><span>Sold</span></div>
          <div className="card stat"><b>{services.length}</b><span>Services</span></div>
          <div className="card stat"><b>{expiringSoon}</b><span>Insurance due</span></div>
        </div>

        <div className="tabs">
          {tabs.map(([key, label]) => (
            <button key={key} className={tab === key ? "tab active" : "tab"} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {error && <div className="error">{error}</div>}

        {tab === "sales" && (
          <section className="card">
            <h3>Customer enquiries</h3>
            {enquiries.length === 0 ? <p className="muted">No enquiries yet.</p> : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Customer</th><th>Bike</th><th>Status</th><th>Follow-up</th><th>Notes</th><th></th></tr>
                  </thead>
                  <tbody>
                    {enquiries.map((q) => <EnquiryRow key={q.id} enquiry={q} onSaved={load} />)}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "customers" && (
          <section className="card">
            <h3>Registered customers</h3>
            {customers.length === 0 ? <p className="muted">No customers yet.</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Customer ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr></thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td><span className="code">{c.customer_code}</span></td>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.phone || "-"}</td>
                        <td>{c.address || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "services" && (
          <>
            <section className="card">
              <h3>Add service record</h3>
              <form className="svc-form" onSubmit={addService}>
                <input name="customer_code" placeholder="Customer ID (e.g. SR-1002)" value={svc.customer_code} onChange={changeSvc} required />
                <input name="vehicle_model" placeholder="Vehicle model" value={svc.vehicle_model} onChange={changeSvc} required />
                <input name="reg_number" placeholder="Registration no." value={svc.reg_number} onChange={changeSvc} />
                <input name="service_date" type="date" value={svc.service_date} onChange={changeSvc} />
                <input name="description" placeholder="Work done" value={svc.description} onChange={changeSvc} />
                <input name="cost" type="number" placeholder="Cost (₹)" value={svc.cost} onChange={changeSvc} />
                <button className="btn">Add record</button>
              </form>
            </section>

            <section className="card">
              <h3>All service records</h3>
              {services.length === 0 ? <p className="muted">No records yet.</p> : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Customer</th><th>Vehicle</th><th>Reg no.</th><th>Date</th><th>Work</th><th>Cost</th></tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr key={s.id}>
                          <td><span className="code">{s.customer_code}</span><div className="muted small">{s.customer_name}</div></td>
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
          </>
        )}

        {tab === "insurance" && (
          <>
            <section className="card">
              <h3>Add insurance policy</h3>
              <form className="svc-form" onSubmit={addPolicy}>
                <input name="customer_code" placeholder="Customer ID (e.g. SR-1002)" value={ins.customer_code} onChange={changeIns} required />
                <input name="vehicle_model" placeholder="Vehicle model" value={ins.vehicle_model} onChange={changeIns} required />
                <input name="reg_number" placeholder="Registration no." value={ins.reg_number} onChange={changeIns} />
                <input name="provider" placeholder="Insurance provider" value={ins.provider} onChange={changeIns} required />
                <input name="policy_number" placeholder="Policy number" value={ins.policy_number} onChange={changeIns} />
                <label className="field">Start date<input name="start_date" type="date" value={ins.start_date} onChange={changeIns} /></label>
                <label className="field">Expiry date<input name="expiry_date" type="date" value={ins.expiry_date} onChange={changeIns} required /></label>
                <input name="premium" type="number" placeholder="Premium (₹)" value={ins.premium} onChange={changeIns} />
                <button className="btn">Add policy</button>
              </form>
            </section>

            <section className="card">
              <h3>All policies (soonest expiry first)</h3>
              {policies.length === 0 ? <p className="muted">No policies yet.</p> : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Customer</th><th>Vehicle</th><th>Provider</th><th>Policy no.</th><th>Premium</th><th>Valid till</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {policies.map((p) => {
                        const st = insuranceStatus(p.expiry_date);
                        return (
                          <tr key={p.id}>
                            <td><span className="code">{p.customer_code}</span><div className="muted small">{p.customer_name}</div></td>
                            <td>{p.vehicle_model}<div className="muted small">{p.reg_number}</div></td>
                            <td>{p.provider}</td>
                            <td>{p.policy_number || "-"}</td>
                            <td>{p.premium != null ? `₹${p.premium}` : "-"}</td>
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
          </>
        )}
      </main>
    </>
  );
}
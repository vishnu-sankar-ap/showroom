export function insuranceStatus(expiry) {
  if (!expiry) return { label: "Unknown", cls: "new" };
  const days = Math.ceil((new Date(expiry) - new Date()) / 86400000);
  if (days < 0) return { label: "Expired", cls: "lost" };
  if (days <= 30) return { label: `Expires in ${days}d`, cls: "follow_up" };
  return { label: "Active", cls: "sold" };
}

export function toBody(form, numeric = []) {
  const body = {};
  for (const [key, value] of Object.entries(form)) {
    body[key] = value === "" ? null : numeric.includes(key) ? Number(value) : value;
  }
  return body;
}
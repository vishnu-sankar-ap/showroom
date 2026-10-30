const BASE = import.meta.env.VITE_API_URL ?? "";

export function getAuth() {
  return { token: localStorage.getItem("token"), role: localStorage.getItem("role") };
}

export function setAuth(token, role) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && token) {
    clearAuth();
    window.location.href = "/";
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data?.detail;
    if (typeof detail === "string") throw new Error(detail);
    if (Array.isArray(detail)) {
      const first = detail[0];
      const field = first?.loc?.slice(1).join(".") || "field";
      throw new Error(`${field}: ${first?.msg}`);
    }
    throw new Error("Something went wrong");
  }
  return data;
}
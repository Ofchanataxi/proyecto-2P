const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "http://localhost:8080";

function getToken() {
  // Obtener token desde localStorage (AuthContext lo guarda ahí)
  const accessToken = localStorage.getItem("access_token");
  return accessToken || null;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_GATEWAY}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return await res.text();
  return await res.json();
}

// Funciones
const listarVentas = () => request("/api/ventas");
const obtenerVenta = (id) => request(`/api/ventas/${id}`);
const crearVenta = (data) =>
  request("/api/ventas", { method: "POST", body: JSON.stringify(data) });
const eliminarVenta = (id) =>
  request(`/api/ventas/${id}`, { method: "DELETE" });

// ✅ Un solo objeto exportado como named + default
export const ventasService = {
  listarVentas,
  getVentas: listarVentas, // Alias para compatibilidad
  getAllVentas: listarVentas, // Alias para compatibilidad
  obtenerVenta,
  getVenta: obtenerVenta, // Alias para compatibilidad
  crearVenta,
  createVenta: crearVenta, // Alias para compatibilidad
  eliminarVenta,
  deleteVenta: eliminarVenta, // Alias para compatibilidad
};

export default ventasService;

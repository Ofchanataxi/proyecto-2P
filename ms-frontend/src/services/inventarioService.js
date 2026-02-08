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
const listarInventarios = () => request("/api/inventarios");
const obtenerInventario = (id) => request(`/api/inventarios/${id}`);
const crearInventario = (data) =>
  request("/api/inventarios", { method: "POST", body: JSON.stringify(data) });
const actualizarInventario = (id, data) =>
  request(`/api/inventarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
const verificarDisponibilidad = (sucursalId, medicamentoId) =>
  request(`/api/inventarios/verificar/${sucursalId}/${medicamentoId}`);

// Sucursales
const listarSucursales = () => request("/api/sucursales");
const obtenerSucursal = (id) => request(`/api/sucursales/${id}`);
const crearSucursal = (data) =>
  request("/api/sucursales", { method: "POST", body: JSON.stringify(data) });
const actualizarSucursal = (id, data) =>
  request(`/api/sucursales/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
const eliminarSucursal = (id) =>
  request(`/api/sucursales/${id}`, { method: "DELETE" });

// ✅ Un solo objeto exportado como named + default
export const inventarioService = {
  listarInventarios,
  getInventarios: listarInventarios, // Alias
  getAllInventarios: listarInventarios, // Alias
  obtenerInventario,
  getInventario: obtenerInventario, // Alias
  crearInventario,
  createInventario: crearInventario, // Alias
  actualizarInventario,
  updateInventario: actualizarInventario, // Alias
  verificarDisponibilidad,
  checkAvailability: verificarDisponibilidad, // Alias
  listarSucursales,
  getSucursales: listarSucursales, // Alias
  getAllSucursales: listarSucursales, // Alias
  obtenerSucursal,
  getSucursal: obtenerSucursal, // Alias
  crearSucursal,
  createSucursal: crearSucursal, // Alias
  actualizarSucursal,
  updateSucursal: actualizarSucursal, // Alias
  eliminarSucursal,
  deleteSucursal: eliminarSucursal, // Alias
};

export default inventarioService;

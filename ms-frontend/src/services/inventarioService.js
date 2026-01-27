const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "http://34.130.207.184:8080";

function getToken() {
  const authority = import.meta.env.VITE_OIDC_AUTHORITY || "http://34.130.207.184:9000";
  const key = `oidc.user:${authority}:farmacia-frontend`;
  const oidcStorage = sessionStorage.getItem(key);
  if (!oidcStorage) return null;

  try {
    const parsed = JSON.parse(oidcStorage);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
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
const actualizarInventario = (id, data) =>
  request(`/api/inventarios/${id}`, { method: "PUT", body: JSON.stringify(data) });

// ✅ Un solo objeto exportado como named + default
export const inventarioService = {
  listarInventarios,
  obtenerInventario,
  actualizarInventario,
};

export default inventarioService;

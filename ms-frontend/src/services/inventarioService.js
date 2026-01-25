import axios from 'axios';
import { User } from 'oidc-client-ts';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

const getAuthHeaders = () => {
  const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:8080:farmacia-frontend");
  if (!oidcStorage) return {};
  const user = User.fromStorageString(oidcStorage);
  return {
    'Authorization': `Bearer ${user.access_token}`,
    'Content-Type': 'application/json'
  };
};

const inventarioAPI = axios.create({
  baseURL: `${API_GATEWAY}/api`,
});

inventarioAPI.interceptors.request.use(config => {
  const headers = getAuthHeaders();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

// Exportación nombrada para que coincida con SucursalesAdmin.jsx
export const inventarioService = {
  // --- SUCURSALES ---
  getAllSucursales: async () => {
    const response = await inventarioAPI.get('/sucursales');
    return response.data;
  },
  getSucursales: async () => {
    const response = await inventarioAPI.get('/sucursales');
    return response.data;
  },
  getSucursalById: async (id) => {
    const response = await inventarioAPI.get(`/sucursales/${id}`);
    return response.data;
  },
  createSucursal: async (sucursal) => {
    const response = await inventarioAPI.post('/sucursales', sucursal);
    return response.data;
  },
  updateSucursal: async (id, sucursal) => {
    const response = await inventarioAPI.put(`/sucursales/${id}`, sucursal);
    return response.data;
  },
  deleteSucursal: async (id) => {
    const response = await inventarioAPI.delete(`/sucursales/${id}`);
    return response.data;
  },

  // --- INVENTARIOS ---
  getInventarios: async () => {
    const response = await inventarioAPI.get('/inventarios');
    return response.data;
  },
  getAllInventarios: async () => {
    const response = await inventarioAPI.get('/inventarios');
    return response.data;
  },
  getInventariosPorSucursal: async (sucursalId) => {
    const response = await inventarioAPI.get(`/inventarios/sucursal/${sucursalId}`);
    return response.data;
  },
  getInventarioById: async (id) => {
    const response = await inventarioAPI.get(`/inventarios/${id}`);
    return response.data;
  },
  createInventario: async (payload) => {
    const response = await inventarioAPI.post('/inventarios', payload);
    return response.data;
  },
  updateInventario: async (id, cantidad) => {
    const response = await inventarioAPI.put(`/inventarios/${id}`, { cantidad });
    return response.data;
  },
  verificarDisponibilidad: async (sucursalId, medicamentoId) => {
    const response = await inventarioAPI.get(`/inventarios/verificar/${sucursalId}/${medicamentoId}`);
    return response.data;
  },
  descontarInventario: async (descontar) => {
    const response = await inventarioAPI.put('/inventarios/descontar', descontar);
    return response.data;
  }
};

// También dejamos el default por si otros archivos lo usan sin llaves
export default inventarioService;
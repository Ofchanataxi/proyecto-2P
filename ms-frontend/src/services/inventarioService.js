import axios from 'axios';
import { User } from 'oidc-client-ts';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

const getAuthHeaders = () => {
  const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:9000:farmacia-frontend");
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

export const inventarioService = {
  // Sucursales
  getAllSucursales: async () => {
    const response = await inventarioAPI.get('/sucursales');
    return response.data;
  },
  
  getSucursalById: async (id) => {
    const response = await inventarioAPI.get(`/sucursales/${id}`);
    return response.data;
  },

  // Inventarios
  getAllInventarios: async () => {
    const response = await inventarioAPI.get('/inventarios');
    return response.data;
  },

  getInventariosPorSucursal: async (sucursalId) => {
    const response = await inventarioAPI.get(`/inventarios/sucursal/${sucursalId}`);
    return response.data;
  },

  // Esta función es la que usa InventarioAdmin.jsx
  // Debe coincidir con lo que espera el Backend: { sucursal: {id: 1}, ... }
  createInventario: async (inventarioData) => {
    const response = await inventarioAPI.post('/inventarios', inventarioData);
    return response.data;
  },

  // Alias para compatibilidad si usabas 'agregarStock'
  agregarStock: async (payload) => {
    return await inventarioAPI.post('/inventarios', payload);
  },

  updateInventario: async (id, cantidad) => {
    const response = await inventarioAPI.put(`/inventarios/${id}`, { cantidad });
    return response.data;
  }
};

export default inventarioService;
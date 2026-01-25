import axios from 'axios';
import { User } from 'oidc-client-ts';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

// Función para obtener el token de la sesión actual
const getAuthHeaders = () => {
  const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:8080:farmacia-frontend");
  if (!oidcStorage) return {};
  const user = User.fromStorageString(oidcStorage);
  return {
    'Authorization': `Bearer ${user.access_token}`,
    'Content-Type': 'application/json'
  };
};

const catalogoAPI = axios.create({
  baseURL: `${API_GATEWAY}/api/medicamentos`,
});

// Interceptor: Inyecta el token en cada petición automáticamente
catalogoAPI.interceptors.request.use(config => {
  const headers = getAuthHeaders();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

export const catalogoService = {
  // Cambiamos el nombre para que Home.jsx lo encuentre
  getMedicamentos: async () => {
    const response = await catalogoAPI.get('');
    return response.data;
  },

  // Alias para compatibilidad con MedicamentosAdmin
  getAllMedicamentos: async () => {
    const response = await catalogoAPI.get('');
    return response.data;
  },

  getMedicamentoById: async (id) => {
    const response = await catalogoAPI.get(`/${id}`);
    return response.data;
  },

  createMedicamento: async (medicamento) => {
    const response = await catalogoAPI.post('', medicamento);
    return response.data;
  },

  updateMedicamento: async (id, medicamento) => {
    const response = await catalogoAPI.put(`/${id}`, medicamento);
    return response.data;
  },

  deleteMedicamento: async (id) => {
    const response = await catalogoAPI.delete(`/${id}`);
    return response.data;
  }
};

export default catalogoService;
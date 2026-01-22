import axios from 'axios';
import { User } from 'oidc-client-ts';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

// Función auxiliar para obtener headers con Token
const getAuthHeaders = () => {
  const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:9000:farmacia-frontend");
  if (!oidcStorage) return {};
  const user = User.fromStorageString(oidcStorage);
  return {
    'Authorization': `Bearer ${user.access_token}`,
    'Content-Type': 'application/json'
  };
};

const ventasAPI = axios.create({
  baseURL: `${API_GATEWAY}/api/ventas`,
});

// Interceptor para inyectar token en cada petición
ventasAPI.interceptors.request.use(config => {
  const headers = getAuthHeaders();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

export const ventasService = {
  createVenta: async (ventaData) => {
    try {
      // El backend espera un objeto Venta. Asegúrate de que ventaData coincida con tu DTO/Entidad
      const response = await ventasAPI.post('', ventaData);
      return response.data;
    } catch (error) {
      console.error('Error en createVenta:', error);
      throw error;
    }
  }
};

export default ventasService;
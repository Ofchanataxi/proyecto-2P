import axios from 'axios';

// Apunta al API Gateway (puerto 8080) que redirige a ms-ventas internamente
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

const ventasAPI = axios.create({
  baseURL: `${API_GATEWAY}/api/ventas`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ventasService = {
  // Crear una nueva venta
  createVenta: async (venta) => {
    const response = await ventasAPI.post('', venta);
    return response.data;
  },

  // Obtener todas las ventas (si se implementa en el backend)
  getAllVentas: async () => {
    try {
      const response = await ventasAPI.get('');
      return response.data;
    } catch (error) {
      console.error('Endpoint no disponible:', error);
      return [];
    }
  },

  // Obtener venta por ID (si se implementa en el backend)
  getVentaById: async (id) => {
    try {
      const response = await ventasAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Endpoint no disponible:', error);
      return null;
    }
  },
};

export default ventasService;

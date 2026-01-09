import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ventasAPI = axios.create({
  baseURL: `${GATEWAY_URL}/api/ventas`, // NOTA: Ya no incluye puerto 8083
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

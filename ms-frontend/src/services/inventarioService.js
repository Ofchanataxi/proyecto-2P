import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const inventarioAPI = axios.create({
  baseURL: `${GATEWAY_URL}/api`, // NOTA: Ya no incluye puerto 8082. Apunta a la raíz del API en el Gateway.
  headers: {
    'Content-Type': 'application/json',
  },
});

export const inventarioService = {
  // --- INVENTARIOS ---
  
  // Crear inventario
  createInventario: async (inventario) => {
    const response = await inventarioAPI.post('/inventarios', inventario);
    return response.data;
  },

  // Obtener inventario por ID
  getInventarioById: async (id) => {
    const response = await inventarioAPI.get(`/inventarios/${id}`);
    return response.data;
  },

  // Verificar disponibilidad
  verificarDisponibilidad: async (sucursalId, medicamentoId) => {
    const response = await inventarioAPI.get(`/inventarios/verificar/${sucursalId}/${medicamentoId}`);
    return response.data;
  },

  // Descontar del inventario
  descontarInventario: async (descontar) => {
    const response = await inventarioAPI.put('/inventarios/descontar', descontar);
    return response.data;
  },

  // --- SUCURSALES ---
  
  // Obtener todas las sucursales
  getAllSucursales: async () => {
    const response = await inventarioAPI.get('/sucursales');
    return response.data;
  },

  // Obtener sucursal por ID
  getSucursalById: async (id) => {
    const response = await inventarioAPI.get(`/sucursales/${id}`);
    return response.data;
  },

  // Crear sucursal
  createSucursal: async (sucursal) => {
    const response = await inventarioAPI.post('/sucursales', sucursal);
    return response.data;
  },

  // Actualizar sucursal
  updateSucursal: async (id, sucursal) => {
    const response = await inventarioAPI.put(`/sucursales/${id}`, sucursal);
    return response.data;
  },

  // Eliminar sucursal
  deleteSucursal: async (id) => {
    const response = await inventarioAPI.delete(`/sucursales/${id}`);
    return response.data;
  },
};

export default inventarioService;

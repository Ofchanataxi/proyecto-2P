import axios from 'axios';

// Apunta al API Gateway (puerto 8080) que redirige a ms-catalogo internamente
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8080';

const catalogoAPI = axios.create({
  baseURL: `${API_GATEWAY}/api/medicamentos`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const catalogoService = {
  // Obtener todos los medicamentos
  getAllMedicamentos: async () => {
    const response = await catalogoAPI.get('');
    return response.data;
  },

  // Obtener un medicamento por ID
  getMedicamentoById: async (id) => {
    const response = await catalogoAPI.get(`/${id}`);
    return response.data;
  },

  // Crear un nuevo medicamento
  createMedicamento: async (medicamento) => {
    const response = await catalogoAPI.post('', medicamento);
    return response.data;
  },

  // Actualizar un medicamento
  updateMedicamento: async (id, medicamento) => {
    const response = await catalogoAPI.put(`/${id}`, medicamento);
    return response.data;
  },

  // Eliminar un medicamento
  deleteMedicamento: async (id) => {
    const response = await catalogoAPI.delete(`/${id}`);
    return response.data;
  },

  // Buscar medicamentos por nombre (normaliza tildes y espacios)
  searchMedicamentos: async (query) => {
    const q = (query || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!q) {
      const response = await catalogoAPI.get('');
      return response.data;
    }
    const response = await catalogoAPI.get('');
    const medicamentos = response.data || [];
    const normalize = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return medicamentos.filter(med =>
      normalize(med.nombre).includes(q) ||
      normalize(med.laboratorio).includes(q)
    );
  },

  // Obtener medicamentos en oferta
  getMedicamentosEnOferta: async () => {
    const response = await catalogoAPI.get('');
    const medicamentos = response.data || [];

    return medicamentos.filter(med => {
      const precioOferta = med.precioUnitario < 5;
      const normalize = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const nombreOferta = normalize(med.nombre).includes('oferta') ||
        normalize(med.nombre).includes('descuento') ||
        normalize(med.nombre).includes('promocion');
      const categoriaOferta = normalize(med.categoria || '').includes('oferta');

      return precioOferta || nombreOferta || categoriaOferta;
    });
  },
};

export default catalogoService;

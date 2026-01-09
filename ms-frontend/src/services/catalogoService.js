import axios from 'axios';

// Usamos la variable base (Gateway) o fallback a localhost:8080
const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const catalogoAPI = axios.create({
  baseURL: `${GATEWAY_URL}/api/medicamentos`, // NOTA: Ya no incluye puerto 8081
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

  // Obtener medicamentos en oferta (productos con precios menores a $5 o que contengan palabras clave de oferta)
  getMedicamentosEnOferta: async () => {
    const response = await catalogoAPI.get('');
    const medicamentos = response.data || [];
    
    // Filtrar productos que podrían considerarse en oferta
    return medicamentos.filter(med => {
      // Criterios para considerar un producto en oferta:
      // 1. Precio menor a $5 (productos económicos)
      // 2. Nombre contiene palabras relacionadas con ofertas
      // 3. Categoría contiene "ofertas"
      
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

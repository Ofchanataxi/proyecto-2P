import axios from 'axios';
import { User } from 'oidc-client-ts';

// Todas las peticiones pasan por el API Gateway
const API_GATEWAY = 'http://localhost:8080';

const getAuthHeaders = () => {
    // Ahora busca con la URL del gateway
    const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:8080:farmacia-frontend");
    if (!oidcStorage) return {};
    const user = User.fromStorageString(oidcStorage);
    return {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
    };
};

const usuarioAPI = axios.create({
    baseURL: API_GATEWAY,
});

usuarioAPI.interceptors.request.use(config => {
    const headers = getAuthHeaders();
    if (headers.Authorization) {
        config.headers.Authorization = headers.Authorization;
    }
    return config;
});

export const usuarioService = {
    getAllUsuarios: async () => {
        const response = await usuarioAPI.get('/usuarios');
        return response.data;
    },
    getUsuarioById: async (id) => {
        const response = await usuarioAPI.get(`/usuarios/${id}`);
        return response.data;
    },
    getUsuarioByUsername: async (username) => {
        const response = await usuarioAPI.get(`/usuarios/buscar/${username}`);
        return response.data;
    },
    createUsuario: async (usuario) => {
        const response = await usuarioAPI.post('/usuarios', usuario);
        return response.data;
    },
    updateUsuario: async (id, usuario) => {
        const response = await usuarioAPI.put(`/usuarios/${id}`, usuario);
        return response.data;
    },
    deleteUsuario: async (id) => {
        const response = await usuarioAPI.delete(`/usuarios/${id}`);
        return response.data;
    }
};

export default usuarioService;

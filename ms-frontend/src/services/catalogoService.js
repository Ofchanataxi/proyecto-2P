import { User } from "oidc-client-ts";

// URL base apuntando al Gateway
const API_URL = (import.meta.env.VITE_API_GATEWAY_HOST || 'http://localhost:8080') + '/api/medicamentos';

// Helper para obtener el token
function getAuthHeader() {
    const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:9000:farmacia-frontend");
    if (!oidcStorage) return {};
    const user = User.fromStorageString(oidcStorage);
    return { 
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
    };
}

export const getMedicamentos = async () => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Error al obtener medicamentos');
    return await response.json();
};

export const getMedicamentoById = async (codigo) => {
    const response = await fetch(`${API_URL}/${codigo}`, {
        method: 'GET',
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Error al obtener el medicamento');
    return await response.json();
};

export const createMedicamento = async (medicamento) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(medicamento)
    });
    if (!response.ok) throw new Error('Error al crear medicamento');
    return await response.json();
};

export const updateMedicamento = async (codigo, medicamento) => {
    const response = await fetch(`${API_URL}/${codigo}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(medicamento)
    });
    if (!response.ok) throw new Error('Error al actualizar medicamento');
    return await response.json();
};
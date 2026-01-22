import { User } from "oidc-client-ts";

const BASE_URL = import.meta.env.VITE_API_GATEWAY_HOST || 'http://localhost:8080';
const SUCURSALES_URL = `${BASE_URL}/api/sucursales`;
const INVENTARIOS_URL = `${BASE_URL}/api/inventarios`;

function getAuthHeader() {
    const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:9000:farmacia-frontend");
    if (!oidcStorage) return {};
    const user = User.fromStorageString(oidcStorage);
    return { 
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
    };
}

// --- SUCURSALES ---
export const getSucursales = async () => {
    const response = await fetch(SUCURSALES_URL, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Error al obtener sucursales');
    return await response.json();
};

export const createSucursal = async (sucursal) => {
    const response = await fetch(SUCURSALES_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(sucursal)
    });
    if (!response.ok) throw new Error('Error al crear sucursal');
    return await response.json();
};

// --- INVENTARIOS ---
export const getInventarioBySucursal = async (codigoSucursal) => {
    // Ajusta la URL según cómo definiste tu endpoint en Java (ej. /sucursal/{id})
    const response = await fetch(`${INVENTARIOS_URL}/sucursal/${codigoSucursal}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Error al obtener inventario');
    return await response.json();
};

export const agregarStock = async (stockRequest) => {
    const response = await fetch(INVENTARIOS_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(stockRequest)
    });
    if (!response.ok) throw new Error('Error al agregar stock');
    return await response.json();
};
import { User } from "oidc-client-ts";

const API_URL = (import.meta.env.VITE_API_GATEWAY_HOST || 'http://localhost:8080') + '/api/ventas';

function getAuthHeader() {
    const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:9000:farmacia-frontend");
    if (!oidcStorage) return {};
    const user = User.fromStorageString(oidcStorage);
    return { 
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
    };
}

export const getVentas = async () => {
    const response = await fetch(API_URL, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Error al obtener ventas');
    return await response.json();
};

export const getVentaById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Error al obtener la venta');
    return await response.json();
};

export const createVenta = async (venta) => {
    /* Estructura esperada de 'venta':
       {
          cedulaCliente: "17...",
          nombreCliente: "Juan",
          detalleVentas: [
             { codigoMedicamento: "M01", cantidad: 2, codigoSucursal: "S01" }
          ]
       }
    */
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(venta)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al procesar la venta');
    }
    return await response.json();
};
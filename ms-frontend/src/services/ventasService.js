import { User } from "oidc-client-ts";

function getUser() {
    // La clave por defecto es oidc.user:<authority>:<client_id>
    const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:9000:farmacia-frontend");
    if (!oidcStorage) return null;
    return User.fromStorageString(oidcStorage);
}

const API_URL = import.meta.env.VITE_API_GATEWAY_HOST + '/api/ventas';

export const createVenta = async (venta) => {
    const user = getUser();
    const token = user?.access_token;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // <--- Token aquí
        },
        body: JSON.stringify(venta)
    });
    return response.json();
};
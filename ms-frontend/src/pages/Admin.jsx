import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicamentosAdmin from '../components/admin/MedicamentosAdmin';
import SucursalesAdmin from '../components/admin/SucursalesAdmin';
import InventarioAdmin from '../components/admin/InventarioAdmin';
import UsuariosAdmin from '../components/admin/UsuariosAdmin'; // Importar
import { User } from 'oidc-client-ts';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('medicamentos');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener token
    try {
      const oidcStorage = sessionStorage.getItem("oidc.user:http://localhost:9000:farmacia-frontend");
      if (oidcStorage) {
        const user = User.fromStorageString(oidcStorage);
        setToken(user.access_token);
      }
    } catch (e) {
      console.error("Error leyendo token:", e);
    }
  }, []);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copiado al portapapeles');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Volver al Inicio
          </button>
          <h1>⚙️ Panel de Administración</h1>
        </div>
      </div>

      <div className="container">

        {/* Token Viewer para fines académicos */}
        <div className="token-viewer" style={{ marginBottom: '20px', background: '#333', color: '#fff', padding: '15px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>🔑 Token de Acceso (Debug)</h4>
            <div>
              <button
                onClick={() => setShowToken(!showToken)}
                style={{ marginRight: '10px', padding: '5px 10px' }}
              >
                {showToken ? 'Ocultar' : 'Mostrar'}
              </button>
              <button onClick={copyToken} style={{ padding: '5px 10px' }}>Copiar</button>
            </div>
          </div>
          {showToken && (
            <div style={{ marginTop: '10px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '12px', background: '#000', padding: '10px', borderRadius: '4px' }}>
              {token || 'No hay token disponible'}
            </div>
          )}
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'medicamentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicamentos')}
          >
            💊 Medicamentos
          </button>
          <button
            className={`tab-btn ${activeTab === 'sucursales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sucursales')}
          >
            📍 Sucursales
          </button>
          <button
            className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventario')}
          >
            📦 Inventario
          </button>
          <button
            className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            👥 Usuarios
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'medicamentos' && <MedicamentosAdmin />}
          {activeTab === 'sucursales' && <SucursalesAdmin />}
          {activeTab === 'inventario' && <InventarioAdmin />}
          {activeTab === 'usuarios' && <UsuariosAdmin />}
        </div>
      </div>
    </div>
  );
};

export default Admin;

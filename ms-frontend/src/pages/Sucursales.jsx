import React, { useState, useEffect } from 'react';
import inventarioService from '../services/inventarioService';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Sucursales = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await inventarioService.getAllSucursales();
        setSucursales(data || []);
      } catch (err) {
        console.error('Error cargando sucursales:', err);
        setSucursales([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Cargando sucursales...</p>;

  return (
    <div className="container">
      <h2>📍 Nuestras Sucursales</h2>
      <div className="sucursales-grid">
        {sucursales.map(s => (
          <div key={s.id} className="sucursal-btn" onClick={() => navigate('/')}> 
            <strong>{s.nombre}</strong>
            <small>{s.direccion}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sucursales;

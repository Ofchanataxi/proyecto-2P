import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { catalogoService } from '../services/catalogoService';
import { inventarioService } from '../services/inventarioService';
import './MedicHome.css';

const MedicHome = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockPorMedicamento, setStockPorMedicamento] = useState({});

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const categorias = ['Todos', 'Analgésicos', 'Antibióticos', 'Antiinflamatorios', 'Vitaminas', 'Otros'];

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (sucursalSeleccionada && medicamentos.length > 0) {
      cargarStockPorSucursal();
    }
  }, [sucursalSeleccionada, medicamentos]);

  const cargarStockPorSucursal = async () => {
    if (!sucursalSeleccionada) return;

    const stockMap = {};
    
    for (const med of medicamentos) {
      try {
        const disponibilidad = await inventarioService.verificarDisponibilidad(
          sucursalSeleccionada,
          med.id
        );
        // El backend retorna 'cantidad' no 'stock'
        stockMap[med.id] = disponibilidad?.cantidad || 0;
      } catch (error) {
        stockMap[med.id] = 0;
      }
    }
    
    setStockPorMedicamento(stockMap);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [medicsData, sucursData] = await Promise.all([
        catalogoService.getAllMedicamentos(),
        inventarioService.getAllSucursales()
      ]);
      setMedicamentos(medicsData);
      setSucursales(sucursData);
      
      // Seleccionar la primera sucursal por defecto
      if (sucursData.length > 0) {
        setSucursalSeleccionada(sucursData[0].id);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (medicamento) => {
    if (!sucursalSeleccionada) {
      alert('Por favor selecciona una sucursal primero');
      return;
    }

    try {
      // Verificar stock en la sucursal seleccionada
      const disponibilidad = await inventarioService.verificarDisponibilidad(
        sucursalSeleccionada,
        medicamento.id
      );

      // El backend retorna 'cantidad' y no tiene campo 'disponible'
      if (disponibilidad && disponibilidad.cantidad > 0) {
        addToCart({
          ...medicamento,
          sucursalId: sucursalSeleccionada,
          stockDisponible: disponibilidad.cantidad
        });
        alert(`${medicamento.nombre} agregado al carrito`);
      } else {
        alert('Producto sin stock en esta sucursal');
      }
    } catch (error) {
      console.error('Error verificando stock:', error);
      alert('Error al verificar el stock');
    }
  };

  const medicamentosFiltrados = medicamentos.filter(med => {
    const matchCategoria = categoriaSeleccionada === 'Todos' || med.categoria === categoriaSeleccionada;
    const matchSearch = searchTerm === '' || 
                       med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (med.laboratorio && med.laboratorio.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategoria && matchSearch;
  });

  if (loading) {
    return <div className="loading-medic">Cargando medicamentos...</div>;
  }

  return (
    <div className="medic-home">
      <div className="medic-header">
        <div className="header-content">
          <h1>🏥 Catálogo de Medicamentos</h1>
          <p className="subtitle">Selecciona los medicamentos que necesites</p>
        </div>
        <button className="cart-button-medic" onClick={() => navigate('/carrito')}>
          🛒 Ver Carrito
        </button>
      </div>

      <div className="filters-section">
        <div className="sucursal-selector">
          <label>📍 Sucursal:</label>
          <select
            value={sucursalSeleccionada || ''}
            onChange={(e) => setSucursalSeleccionada(Number(e.target.value))}
          >
            <option value="">Selecciona una sucursal</option>
            {sucursales.map(suc => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre} - {suc.direccion}
              </option>
            ))}
          </select>
          <button 
            className="refresh-button"
            onClick={cargarStockPorSucursal}
            disabled={!sucursalSeleccionada}
            title="Actualizar stock"
            style={{
              marginLeft: '10px',
              padding: '8px 16px',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: sucursalSeleccionada ? 'pointer' : 'not-allowed',
              opacity: sucursalSeleccionada ? 1 : 0.5
            }}
          >
            🔄 Actualizar
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o laboratorio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="categories-bar">
        {categorias.map(cat => (
          <button
            key={cat}
            className={`category-btn ${categoriaSeleccionada === cat ? 'active' : ''}`}
            onClick={() => setCategoriaSeleccionada(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="medicamentos-grid">
        {medicamentosFiltrados.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron medicamentos</p>
          </div>
        ) : (
          medicamentosFiltrados.map(med => {
            const stock = stockPorMedicamento[med.id] || 0;
            const sinStock = stock === 0;

            return (
              <div key={med.id} className="medicamento-card-medic">
                <div className="card-header-medic">
                  <h3>{med.nombre}</h3>
                  <span className="categoria-badge">{med.categoria}</span>
                </div>
                <p className="laboratorio" style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  🏭 {med.laboratorio}
                </p>
                <div className="stock-info" style={{
                  padding: '8px',
                  margin: '8px 0',
                  borderRadius: '4px',
                  backgroundColor: sinStock ? '#ffebee' : '#e8f5e9',
                  color: sinStock ? '#c62828' : '#2e7d32',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  📦 Stock: {stock} unidades
                  {sinStock && <div style={{ fontSize: '12px', marginTop: '4px' }}>Sin disponibilidad</div>}
                </div>
                <div className="card-footer-medic">
                  <span className="precio">${med.precioUnitario?.toFixed(2) || '0.00'}</span>
                  <button
                    className="add-button"
                    onClick={() => handleAddToCart(med)}
                    disabled={!sucursalSeleccionada || sinStock}
                    style={{
                      opacity: sinStock ? 0.5 : 1,
                      cursor: sinStock ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {sinStock ? 'Sin stock' : 'Agregar'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MedicHome;

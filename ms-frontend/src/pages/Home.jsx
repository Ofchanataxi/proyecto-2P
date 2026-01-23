import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import inventarioService from '../services/inventarioService';
import { useCart } from '../context/CartContext';
import Modal from '../components/Modal'; // Importar Modal
import './Home.css';

const Home = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { addToCart, sucursalId, selectSucursal } = useCart();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [categoryMap, setCategoryMap] = useState({});

  // Estado para el Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const cleanCategoryName = (categoryName) => {
    if (!categoryName || typeof categoryName !== 'string') return categoryName;
    const categoryMapping = {
      'AnalgÃ©sicos': 'Analgesicos', 'Analgésicos': 'Analgesicos',
      'AntibiÃ³ticos': 'Antibioticos', 'Antibióticos': 'Antibioticos',
      'VitamÃ­nas': 'Vitaminas', 'OfertÃ¡s': 'Ofertas'
    };
    if (categoryMapping[categoryName]) return categoryMapping[categoryName];
    return categoryName.replace(/Ã©/g, 'e').replace(/Ã³/g, 'o').replace(/Ã­/g, 'i').replace(/Ã¡/g, 'a').replace(/Ãº/g, 'u').replace(/Ã±/g, 'n');
  };

  const slugify = (s) => {
    return normalize(s).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  useEffect(() => {
    const slug = params?.categoria;
    if (!slug) return;
    const key = slug.toLowerCase();
    if (categoryMap && categoryMap[key]) {
      setSelectedCategory(categoryMap[key]);
      return;
    }
    const staticFallback = {
      'todos': 'todos', 'analgesicos': 'Analgesicos',
      'antibioticos': 'Antibioticos', 'vitaminas': 'Vitaminas', 'ofertas': 'Ofertas'
    };
    if (staticFallback[key]) {
      setSelectedCategory(staticFallback[key]);
      return;
    }
    const guess = key.replace(/-/g, ' ');
    const guessed = guess.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    setSelectedCategory(guessed);
  }, [params, categoryMap]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    if (query && query.trim()) {
      setSearchQuery(query.trim());
      setIsSearchMode(true);
      setSelectedCategory('todos');
    } else {
      setIsSearchMode(false);
      setSearchQuery('');
    }
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medicamentosData, sucursalesData] = await Promise.all([
        catalogoService.getMedicamentos(),
        inventarioService.getSucursales(),
      ]);

      const fixed = (medicamentosData || []).map(m => ({
        ...m,
        nombre: m.nombre,
        categoria: cleanCategoryName(m.categoria)
      }));
      setMedicamentos(fixed);
      setSucursales(Array.isArray(sucursalesData) ? sucursalesData : []);

      const map = {};
      fixed.forEach(m => {
        if (m && m.categoria) {
          const slug = slugify(m.categoria);
          map[slug] = m.categoria;
        }
      });
      map['todos'] = 'todos';
      setCategoryMap(map);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMedicamentos([]);
      setSucursales([]);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
    // Auto-cerrar después de 3 segundos opcionalmente
    // setTimeout(() => setModalOpen(false), 3000);
  };

  const handleAddToCart = (medicamento) => {
    if (!sucursalId) {
      showModal('⚠️ Por favor selecciona una sucursal primero');
      return;
    }
    try {
      addToCart(medicamento, 1);
      showModal(`${medicamento.nombre} agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  const normalize = (str) => {
    if (!str && str !== '') return '';
    return String(str).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const filteredMedicamentos = (() => {
    let result = medicamentos;
    if (isSearchMode && searchQuery.trim()) {
      const query = normalize(searchQuery.trim());
      result = medicamentos.filter(med => {
        const nombre = normalize(med.nombre || '');
        const laboratorio = normalize(med.laboratorio || '');
        const categoria = normalize(med.categoria || '');
        return nombre.includes(query) || laboratorio.includes(query) || categoria.includes(query);
      });
    } else if (selectedCategory === 'todos') {
      result = medicamentos;
    } else if (selectedCategory === 'Ofertas') {
      result = medicamentos.filter(med => med.precioUnitario < 5 || normalize(med.nombre).includes('oferta'));
    } else {
      result = medicamentos.filter(med => {
        if (!med || !med.categoria) return false;
        return normalize(med.categoria) === normalize(selectedCategory);
      });
    }
    return result;
  })();

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Cargando...</p></div>;

  return (
    <div className="home">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />

      <section className="hero-banner">
        <div className="container">
          <div className="hero-content">
            <h1>¡Bienvenido a tu Farmacia Online!</h1>
            <p>Tu salud es nuestra prioridad.</p>
          </div>
        </div>
      </section>

      {!sucursalId && sucursales.length > 0 && (
        <section className="sucursal-selector">
          <div className="container">
            <h3>📍 Selecciona tu sucursal</h3>
            <div className="sucursales-grid">
              {sucursales.map(sucursal => (
                <button key={sucursal.id} className="sucursal-btn" onClick={() => selectSucursal(sucursal.id)}>
                  <strong>{sucursal.nombre}</strong><small>{sucursal.direccion}</small>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {sucursalId && (
        <section className="selected-sucursal">
          <div className="container">
            <p>📍 Sucursal: <strong>{sucursales.find(s => s.id === sucursalId)?.nombre}</strong> <button className="change-btn" onClick={() => selectSucursal(null)}>Cambiar</button></p>
          </div>
        </section>
      )}

      {!isSearchMode && (
        <section className="categories-section">
          <div className="container">
            <h2>Categorías</h2>
            <div className="categories-grid">
              <button className={`category-card ${selectedCategory === 'todos' ? 'active' : ''}`} onClick={() => navigate('/categorias/todos')}>
                <h3>Todos</h3>
              </button>
              {/* Puedes agregar más botones estáticos o dinámicos aquí */}
            </div>
          </div>
        </section>
      )}

      <section className="products-section">
        <div className="container">
          <h2>{isSearchMode ? `Resultados: "${searchQuery}"` : 'Productos Disponibles'}</h2>
          <div className="products-grid">
            {filteredMedicamentos.map((medicamento) => (
              <div key={medicamento.id} className="product-card">
                <div className="product-image">
                  <span className="product-icon">💊</span>
                </div>
                <div className="product-info">
                  <h3>{medicamento.nombre}</h3>
                  <p>{medicamento.laboratorio}</p>
                  <p className="price">${medicamento.precioUnitario.toFixed(2)}</p>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(medicamento)} disabled={!sucursalId}>
                    {sucursalId ? 'Agregar al carrito' : 'Selecciona sucursal'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
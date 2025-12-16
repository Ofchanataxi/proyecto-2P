import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import inventarioService from '../services/inventarioService';
import { useCart } from '../context/CartContext';
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

  // Dynamic slug map derived from medicamentos (slug -> displayName)
  const [categoryMap, setCategoryMap] = useState({});

  // Limpiar nombres de categorías para evitar problemas de codificación
  const cleanCategoryName = (categoryName) => {
    if (!categoryName || typeof categoryName !== 'string') return categoryName;
    
    // Mapeo de categorías problemáticas a versiones limpias
    const categoryMapping = {
      'AnalgÃ©sicos': 'Analgesicos',
      'Analgésicos': 'Analgesicos',
      'AntibiÃ³ticos': 'Antibioticos', 
      'Antibióticos': 'Antibioticos',
      'VitamÃ­nas': 'Vitaminas',
      'OfertÃ¡s': 'Ofertas'
    };
    
    // Buscar coincidencia exacta primero
    if (categoryMapping[categoryName]) {
      return categoryMapping[categoryName];
    }
    
    // Si no hay coincidencia exacta, limpiar caracteres problemáticos
    return categoryName
      .replace(/Ã©/g, 'e')
      .replace(/Ã³/g, 'o') 
      .replace(/Ã­/g, 'i')
      .replace(/Ã¡/g, 'a')
      .replace(/Ãº/g, 'u')
      .replace(/Ã±/g, 'n');
  };

  // Helper to create URL-friendly slugs from category display names
  const slugify = (s) => {
    return normalize(s)
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  // When route param changes, sync it to selectedCategory (if valid)
  useEffect(() => {
    const slug = params?.categoria;
    if (!slug) return;
    const key = slug.toLowerCase();
    // prefer dynamic map, fallback to some common names
    if (categoryMap && categoryMap[key]) {
      setSelectedCategory(categoryMap[key]);
      return;
    }
    const staticFallback = {
      'todos': 'todos',
      'analgesicos': 'Analgesicos',
      'antibioticos': 'Antibioticos',
      'vitaminas': 'Vitaminas',
      'ofertas': 'Ofertas'
    };
    if (staticFallback[key]) {
      setSelectedCategory(staticFallback[key]);
      return;
    }
    // try to convert slug back to a readable string
    const guess = key.replace(/-/g, ' ');
    const guessed = guess.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    setSelectedCategory(guessed);
  }, [params, categoryMap]);

  useEffect(() => {
    loadData();
  }, []);

  // Detectar parámetros de búsqueda en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    if (query && query.trim()) {
      setSearchQuery(query.trim());
      setIsSearchMode(true);
      setSelectedCategory('todos'); // Resetear categoría cuando se busca
    } else {
      setIsSearchMode(false);
      setSearchQuery('');
    }
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medicamentosData, sucursalesData] = await Promise.all([
        catalogoService.getAllMedicamentos(),
        inventarioService.getAllSucursales(),
      ]);
      // limpiar nombres de categorías para evitar problemas de codificación
      const fixed = (medicamentosData || []).map(m => ({
        ...m,
        nombre: m.nombre,
        categoria: cleanCategoryName(m.categoria)
      }));
      setMedicamentos(fixed);
      setSucursales(sucursalesData);
      // build categoryMap from medicamentos
      const map = {};
      fixed.forEach(m => {
        if (m && m.categoria) {
          const slug = slugify(m.categoria);
          map[slug] = m.categoria;
        }
      });
      // ensure common categories exist
      map['todos'] = 'todos';
      setCategoryMap(map);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos. Verifica que los servicios estén corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (medicamento) => {
    if (!sucursalId) {
      alert('Por favor selecciona una sucursal primero');
      return;
    }
    
    try {
      addToCart(medicamento, 1);
      // Mostrar notificación más amigable
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          font-family: Arial, sans-serif;
          animation: slideInRight 0.3s ease;
        ">
          ✅ ${medicamento.nombre} agregado al carrito
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remover notificación después de 3 segundos
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.style.animation = 'slideOutRight 0.3s ease';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar el producto al carrito. Intenta de nuevo.');
    }
  };

  // Debug: log cuando cambia la categoría seleccionada
  useEffect(() => {
    console.debug('selectedCategory changed ->', selectedCategory);
  }, [selectedCategory]);

  // Helper to normalize strings: lowercase, trim and remove diacritics (tildes)
  const normalize = (str) => {
    if (!str && str !== '') return '';
    return String(str)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Lógica de filtrado que incluye búsqueda
  const filteredMedicamentos = (() => {
    let result = medicamentos;

    // Si estamos en modo búsqueda, filtrar por la consulta
    if (isSearchMode && searchQuery.trim()) {
      const query = normalize(searchQuery.trim());
      result = medicamentos.filter(med => {
        const nombre = normalize(med.nombre || '');
        const laboratorio = normalize(med.laboratorio || '');
        const categoria = normalize(med.categoria || '');
        const codigoBarra = normalize(med.codigoBarra || '');
        
        return nombre.includes(query) || 
               laboratorio.includes(query) || 
               categoria.includes(query) ||
               codigoBarra.includes(query);
      });
    }
    // Si no estamos en modo búsqueda, aplicar filtros de categoría
    else if (selectedCategory === 'todos') {
      result = medicamentos;
    }
    else if (selectedCategory === 'Ofertas') {
      result = medicamentos.filter(med => {
        // Mostrar productos en oferta basados en criterios específicos
        const precioOferta = med.precioUnitario < 5;
        const nombreOferta = normalize(med.nombre).includes('oferta') || 
                            normalize(med.nombre).includes('descuento') || 
                            normalize(med.nombre).includes('promocion');
        const categoriaOferta = normalize(med.categoria || '').includes('oferta');
        
        return precioOferta || nombreOferta || categoriaOferta;
      });
    }
    else {
      result = medicamentos.filter(med => {
        if (!med || !med.categoria) return false;
        const categoria = normalize(med.categoria);
        const selected = normalize(selectedCategory);
        return categoria === selected;
      });
    }

    return result;
  })();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  // Debug: log antes de renderizar los productos filtrados
  console.debug('filteredMedicamentos count ->', filteredMedicamentos.length);

  return (
    <div className="home">
      {/* Banner Principal */}
      <section className="hero-banner">
        <div className="container">
          <div className="hero-content">
            <h1>¡Bienvenido a tu Farmacia Online!</h1>
            <p>Tu salud es nuestra prioridad. Entrega rápida y segura.</p>
            <div className="hero-features">
              <div className="feature">
                <span className="icon">🚚</span>
                <span>Envío Gratis desde $30</span>
              </div>
              <div className="feature">
                <span className="icon">⚡</span>
                <span>Entrega en 45-120 min</span>
              </div>
              <div className="feature">
                <span className="icon">🔒</span>
                <span>Compra Segura</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selector de Sucursal */}
      {!sucursalId && sucursales.length > 0 && (
        <section className="sucursal-selector">
          <div className="container">
            <div className="selector-card">
              <h3>📍 Selecciona tu sucursal para comenzar</h3>
              <div className="sucursales-grid">
                {sucursales.map(sucursal => (
                  <button
                    key={sucursal.id}
                    className="sucursal-btn"
                    onClick={() => selectSucursal(sucursal.id)}
                  >
                    <strong>{sucursal.nombre}</strong>
                    <small>{sucursal.direccion}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {sucursalId && (
        <section className="selected-sucursal">
          <div className="container">
            <p>
              📍 Sucursal seleccionada: <strong>{sucursales.find(s => s.id === sucursalId)?.nombre}</strong>
              <button onClick={() => selectSucursal(null)} className="change-btn">Cambiar</button>
            </p>
          </div>
        </section>
      )}

      {/* Categorías - Solo mostrar si no estamos en modo búsqueda */}
      {!isSearchMode && (
        <section className="categories-section">
          <div className="container">
            <h2>Categorías Destacadas</h2>
          <div className="categories-grid">
            {/* Render categories dynamically from categoryMap (fallback to static list) */}
            {Object.keys(categoryMap).length === 0 ? (
              <>
                <button className={`category-card ${selectedCategory === 'todos' ? 'active' : ''}`} onClick={() => navigate('/categorias/todos')}>
                    <img src="/icons/todos.svg" alt="todos" className="category-img" />
                    <h3>Todos</h3>
                  </button>
                <button className={`category-card ${selectedCategory === 'Analgesicos' ? 'active' : ''}`} onClick={() => navigate('/categorias/analgesicos')}>
                  <img src="/icons/analgesicos.svg" alt="analgesicos" className="category-img" />
                  <h3>Analgesicos</h3>
                </button>
                <button className={`category-card ${selectedCategory === 'Antibioticos' ? 'active' : ''}`} onClick={() => navigate('/categorias/antibioticos')}>
                  <img src="/icons/antibioticos.svg" alt="antibioticos" className="category-img" />
                  <h3>Antibioticos</h3>
                </button>
                <button className={`category-card ${selectedCategory === 'Vitaminas' ? 'active' : ''}`} onClick={() => navigate('/categorias/vitaminas')}>
                  <img src="/icons/vitaminas.svg" alt="vitaminas" className="category-img" />
                  <h3>Vitaminas</h3>
                </button>
                <button className={`category-card ${selectedCategory === 'Ofertas' ? 'active' : ''}`} onClick={() => navigate('/categorias/ofertas')}>
                  <img src="/icons/ofertas.svg" alt="ofertas" className="category-img" />
                  <h3>Ofertas</h3>
                </button>
              </>
            ) : (
              Object.keys(categoryMap).map(slug => {
                // Helper function to get the correct icon based on category
                const getCategoryIcon = (categoryName) => {
                  const normalized = normalize(categoryName || '');
                  const iconMap = {
                    'todos': '/icons/todos.svg',
                    'analgesicos': '/icons/analgesicos.svg',
                    'antibioticos': '/icons/antibioticos.svg',
                    'vitaminas': '/icons/vitaminas.svg',
                    'ofertas': '/icons/ofertas.svg'
                  };
                  
                  // Check for exact matches first
                  if (iconMap[slug]) return iconMap[slug];
                  
                  // Check for category name matches
                  if (normalized.includes('analgesico')) return '/icons/analgesicos.svg';
                  if (normalized.includes('antibiotico')) return '/icons/antibioticos.svg';
                  if (normalized.includes('vitamina')) return '/icons/vitaminas.svg';
                  if (normalized.includes('oferta')) return '/icons/ofertas.svg';
                  
                  // Default fallback
                  return '/icons/todos.svg';
                };

                return (
                  <button
                    key={slug}
                    className={`category-card ${normalize(categoryMap[slug]) === normalize(selectedCategory) ? 'active' : ''}`}
                    onClick={() => navigate(`/categorias/${slug}`)}
                  >
                    <img src={getCategoryIcon(categoryMap[slug])} alt={slug} className="category-img" />
                    <h3>{cleanCategoryName(categoryMap[slug])}</h3>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>
      )}

      {/* Productos */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            {isSearchMode ? (
              <div className="search-info">
                <h2>Resultados de búsqueda para: "{searchQuery}"</h2>
                <p>{filteredMedicamentos.length} producto(s) encontrado(s)</p>
                <button 
                  className="clear-search-btn"
                  onClick={() => {
                    setIsSearchMode(false);
                    setSearchQuery('');
                    navigate('/');
                  }}
                >
                  ❌ Limpiar búsqueda
                </button>
              </div>
            ) : (
              <h2>Productos Disponibles</h2>
            )}
            <button className="admin-link-btn" onClick={() => navigate('/admin')}>
              ⚙️ Ir a Administración
            </button>
          </div>

          {filteredMedicamentos.length === 0 ? (
            <div className="empty-state">
              {isSearchMode ? (
                <>
                  <p>🔍 No se encontraron medicamentos para "{searchQuery}"</p>
                  <p>Intenta con otros términos de búsqueda</p>
                  <button 
                    onClick={() => {
                      setIsSearchMode(false);
                      setSearchQuery('');
                      navigate('/');
                    }} 
                    className="reload-btn"
                  >
                    🏠 Ver todos los productos
                  </button>
                </>
              ) : (
                <>
                  <p>No hay medicamentos disponibles en esta categoría</p>
                  <button onClick={loadData} className="reload-btn">🔄 Recargar</button>
                </>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredMedicamentos.map((medicamento, index) => (
                  <div 
                    key={medicamento.id} 
                    className="product-card"
                    style={{'--animation-delay': index}}
                  >
                    {/* Indicador de oferta */}
                    {(medicamento.precioUnitario < 5 || 
                      normalize(medicamento.nombre).includes('oferta') || 
                      normalize(medicamento.categoria || '').includes('oferta')) && (
                      <div className="offer-badge">¡OFERTA!</div>
                    )}
                    <div className="product-image">
                      {medicamento.imagenUrl ? (
                        <img 
                          src={medicamento.imagenUrl} 
                          alt={medicamento.nombre}
                          className="product-img"
                          onError={(e) => {
                            try {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'block';
                              }
                            } catch (err) {
                              // no queremos romper el render por un error en onError
                              console.debug('Image onError handler failed', err);
                            }
                          }}
                        />
                      ) : null}
                      <span className="product-icon" style={medicamento.imagenUrl ? {display: 'none'} : {}}>💊</span>
                    </div>
                  <div className="product-info">
                    <h3>{medicamento.nombre}</h3>
                    <p className="laboratory">{medicamento.laboratorio}</p>
                    {medicamento.categoria && (
                      <p className="category">📦 {medicamento.categoria}</p>
                    )}
                    <p className="barcode">Código: {medicamento.codigoBarra}</p>
                    <div className="product-footer">
                      <span className="price">${medicamento.precioUnitario.toFixed(2)}</span>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(medicamento)}
                        disabled={!sucursalId}
                        title={!sucursalId ? 'Selecciona una sucursal primero' : `Agregar ${medicamento.nombre} al carrito`}
                      >
                        {!sucursalId ? '🏪 Seleccionar sucursal' : '🛒 Agregar al carrito'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;

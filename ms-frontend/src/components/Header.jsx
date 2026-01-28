import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';
import Modal from './Modal';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount, clearCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Estado para el modal de confirmación
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Obtener información del usuario desde el token
  const userName = user?.preferred_username || user?.username || user?.sub || 'Usuario';

  // Lógica de detección de rol con fallback
  let userRole = 'USER';
  const roleClaim = user?.role || user?.roles || user?.authorities;

  if (roleClaim) {
    const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) {
      userRole = 'ADMIN';
    } else {
      userRole = roles[0] || 'USER';
    }
  }

  // FALLBACK TEMPORAL DE SEGURIDAD
  if (userName === 'admin') {
    userRole = 'ADMIN';
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Función para abrir el modal
  const confirmLogout = () => {
    setShowLogoutModal(true);
    setShowUserMenu(false); // Cerrar dropdown si está abierto
  };

  // Ejecutar el logout real
  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      // Limpiar datos locales
      clearCart();
      
      // Usar la función logout del contexto
      await logout();
      
      // Redirigir al home
      navigate('/');
    } catch (error) {
      console.error('Error logout:', error);
    }
  };

  return (
    <>
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        message="¿Estás seguro de que deseas cerrar sesión?"
        type="confirm"
      />

      <header className="header">
        <div className="header-top">
          <div className="container">
            <div className="header-info">
              <span>📞 1800-FARMACIA</span>
              <span>📧 info@farmacia.com</span>
              <span>⏰ Horario: 24/7</span>
            </div>

            {isAuthenticated ? (
              <div className="user-section">
                <div
                  className="user-info-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="user-avatar">👤</span>
                  <div className="user-details">
                    <span className="user-name">{userName}</span>
                    <span className="user-role">{userRole}</span>
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </div>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{userName}</strong>
                      <small>Rol: {userRole}</small>
                    </div>
                    <hr />
                    <button
                      onClick={() => { navigate('/perfil'); setShowUserMenu(false); }}
                      className="dropdown-link profile-link"
                    >
                      👤 Mi Perfil
                    </button>
                    <button
                      onClick={() => { navigate('/perfil'); setShowUserMenu(false); }}
                      className="dropdown-link"
                    >
                      ⚙️ Configuración de Cuenta
                    </button>
                    <button onClick={confirmLogout} className="logout-btn">
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <button onClick={() => navigate('/login')}>Iniciar Sesión</button>
              </div>
            )}
          </div>
        </div>

        <div className="header-main">
          <div className="container">
            <div className="logo" onClick={() => navigate('/')}>
              🏥 <span>Farmacia Online</span>
            </div>

            {['/', '/sucursales'].some(path => location.pathname === path || location.pathname.startsWith(path + '/')) && (
              <form className="search-bar" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Buscar medicamentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">🔍 Buscar</button>
              </form>
            )}

            <div className="header-actions">
              {userRole === 'ADMIN' && (
                <Link to="/admin" className="header-link admin-link">
                  ⚙️ Admin
                </Link>
              )}
              <Link to="/carrito" className="cart-link">
                🛒 Carrito
                {getItemCount() > 0 && (
                  <span className="cart-badge">{getItemCount()}</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        <nav className="navbar">
          <div className="container">
            <Link to="/">🏠 Inicio</Link>
            <Link to="/sucursales">📍 Sucursales</Link>
            <a href="#contacto">📞 Contacto</a>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { getItemCount } = useCart();
  const { user, isAuthenticated, logout, isAdmin, isMedico } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // No mostrar header en la página de login
  if (window.location.pathname === '/login') {
    return null;
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-info">
            <span>📞 1800-FARMACIA</span>
            <span>📧 info@farmacia.com</span>
            <span>⏰ Horario: 24/7</span>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <Link to="/" className="logo">
            <h1>🏥 Farmacia Online</h1>
          </Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar medicamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">🔍 Buscar</button>
          </form>

          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <span className="user-info">
                  👤 {user.username} ({user.rol})
                </span>
                {isAdmin() && (
                  <Link to="/admin" className="header-link">
                    ⚙️ Admin
                  </Link>
                )}
                <Link to="/carrito" className="cart-link">
                  🛒 Carrito
                  {getItemCount() > 0 && (
                    <span className="cart-badge">{getItemCount()}</span>
                  )}
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  🚪 Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="header-link">
                🔐 Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="container">
          {isAuthenticated ? (
            <>
              {isAdmin() && <Link to="/">🏠 Inicio</Link>}
              {isMedico() && <Link to="/medico">🏠 Catálogo</Link>}
              <Link to="/sucursales">📍 Sucursales</Link>
            </>
          ) : (
            <Link to="/login">🔐 Iniciar Sesión</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { getItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
            <Link to="/admin" className="header-link">
              👤 Admin
            </Link>
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
        </div>
      </nav>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import inventarioService from '../services/inventarioService';
import ventasService from '../services/ventasService';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal, sucursalId } = useCart();
  const [sucursales, setSucursales] = useState([]);
  const [clienteData, setClienteData] = useState({
    nombre: '',
    cedula: '',
    email: '',
    telefono: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      const data = await inventarioService.getAllSucursales();
      setSucursales(data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!sucursalId) {
      alert('Por favor selecciona una sucursal');
      return;
    }

    if (!clienteData.nombre || !clienteData.cedula) {
      alert('Por favor completa los datos del cliente (nombre y cédula son obligatorios)');
      return;
    }

    setIsProcessing(true);

    try {
      // Preparar datos de la venta
      const ventaData = {
        cliente: {
          nombre: clienteData.nombre,
          cedula: clienteData.cedula,
          email: clienteData.email || null,
          telefono: clienteData.telefono || null,
        },
        sucursalId: sucursalId,
        detalles: cart.map(item => ({
          medicamentoId: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.precioUnitario * item.cantidad,
        })),
        total: getTotal(),
      };

      // Realizar la venta
      const response = await ventasService.createVenta(ventaData);
      
      alert(`¡Venta realizada con éxito! \nTotal: $${getTotal().toFixed(2)}\nID de Venta: ${response.id || 'N/A'}`);
      
      // Limpiar carrito y formulario
      clearCart();
      setClienteData({ nombre: '', cedula: '', email: '', telefono: '' });
      
      // Redirigir al home
      navigate('/');
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      alert('Error al procesar la venta: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const getSucursalName = () => {
    const sucursal = sucursales.find(s => s.id === sucursalId);
    return sucursal ? sucursal.nombre : 'No seleccionada';
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <h2>Tu carrito está vacío</h2>
            <p>¡Agrega productos para comenzar tu compra!</p>
            <button onClick={() => navigate('/')} className="continue-shopping-btn">
              🏠 Ir a Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">🛒 Mi Carrito de Compras</h1>

        <div className="cart-layout">
          {/* Lista de Productos */}
          <div className="cart-items">
            <div className="cart-header">
              <h2>Productos ({cart.length})</h2>
              <button onClick={clearCart} className="clear-cart-btn">
                🗑️ Vaciar Carrito
              </button>
            </div>

            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <span className="item-icon">💊</span>
                </div>
                <div className="item-details">
                  <h3>{item.nombre}</h3>
                  <p className="item-lab">{item.laboratorio}</p>
                  <p className="item-code">Código: {item.codigoBarra}</p>
                  <p className="item-price">${item.precioUnitario.toFixed(2)} c/u</p>
                </div>
                <div className="item-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    min="1"
                    className="qty-input"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  <p className="subtotal-label">Subtotal:</p>
                  <p className="subtotal-price">${(item.precioUnitario * item.cantidad).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                  title="Eliminar del carrito"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          {/* Resumen de Compra */}
          <div className="cart-summary">
            <h2>Resumen de Compra</h2>

            <div className="summary-section">
              <h3>📍 Sucursal de Entrega</h3>
              <p className="sucursal-info">{getSucursalName()}</p>
              {!sucursalId && (
                <button onClick={() => navigate('/')} className="select-sucursal-btn">
                  Seleccionar Sucursal
                </button>
              )}
            </div>

            <div className="summary-section">
              <h3>👤 Datos del Cliente</h3>
              <form className="client-form">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={clienteData.nombre}
                  onChange={(e) => setClienteData({ ...clienteData, nombre: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Cédula *"
                  value={clienteData.cedula}
                  onChange={(e) => setClienteData({ ...clienteData, cedula: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={clienteData.email}
                  onChange={(e) => setClienteData({ ...clienteData, email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={clienteData.telefono}
                  onChange={(e) => setClienteData({ ...clienteData, telefono: e.target.value })}
                />
              </form>
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Envío:</span>
                <span className="free-shipping">GRATIS</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="checkout-btn"
              disabled={isProcessing || !sucursalId}
            >
              {isProcessing ? '⏳ Procesando...' : '✅ Finalizar Compra'}
            </button>

            <button onClick={() => navigate('/')} className="continue-shopping-link">
              ← Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

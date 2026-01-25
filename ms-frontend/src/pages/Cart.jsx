import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { inventarioService } from '../services/inventarioService';
import { ventasService } from '../services/ventasService';
import Modal from '../components/Modal';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal, sucursalId } = useCart();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({ cedula: '', nombre: '', email: '', telefono: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', type: 'success' });

  const showModal = (message, type = 'success') => {
    setModalInfo({ isOpen: true, message, type });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!sucursalId) {
      showModal('⚠️ Por favor selecciona una sucursal antes de continuar', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        cliente: { ...cliente },
        sucursalId: parseInt(sucursalId),
        detalles: cart.map(item => ({
          medicamentoId: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        })),
        total: getTotal()
      };

      console.log("Enviando venta:", payload);
      await ventasService.createVenta(payload);

      showModal('✅ ¡Compra realizada exitosamente! El inventario ha sido actualizado.', 'success');

      // Clear cart and navigate after a short delay
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);

      // Provide more specific error message
      let errorMessage = '❌ Error al procesar la compra.';

      if (err.response?.status === 400) {
        errorMessage = '❌ Stock insuficiente. Algunos productos no tienen stock disponible en esta sucursal.';
      } else if (err.response?.status === 404) {
        errorMessage = '❌ Producto o sucursal no encontrados. Verifique su selección.';
      } else if (err.response?.data?.message) {
        errorMessage = `❌ ${err.response.data.message}`;
      } else {
        errorMessage = '❌ Error de conexión. Verifique el stock o intente nuevamente.';
      }

      showModal(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <Modal
          isOpen={modalInfo.isOpen}
          onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
          message={modalInfo.message}
          type={modalInfo.type}
        />
        <div className="container">
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <h2>Tu carrito está vacío</h2>
            <p>¡Explora nuestro catálogo y encuentra lo que necesitas!</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/')}>
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
        message={modalInfo.message}
        type={modalInfo.type}
      />

      <div className="container">
        <h1 className="page-title">🛒 Finalizar Compra</h1>

        <div className="cart-layout">
          {/* Sección de Items */}
          <div className="cart-items">
            <div className="cart-header">
              <h2>Productos ({cart.reduce((ack, item) => ack + item.cantidad, 0)})</h2>
              <button className="clear-cart-btn" onClick={clearCart}>Vaciar Carrito</button>
            </div>

            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.imagenUrl ? (
                    <img
                      src={item.imagenUrl}
                      alt={item.nombre}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <span className="item-icon" style={{ display: item.imagenUrl ? 'none' : 'flex' }}>💊</span>
                </div>

                <div className="item-details">
                  <h3>{item.nombre}</h3>
                  <p className="item-lab">{item.laboratorio}</p>
                  <p className="item-price">${item.precioUnitario.toFixed(2)} c/u</p>
                </div>

                <div className="item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                  >-</button>
                  <span className="qty-input">{item.cantidad}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                  >+</button>
                </div>

                <div className="item-total">
                  <p className="subtotal-label">Subtotal</p>
                  <p className="subtotal-price">${(item.precioUnitario * item.cantidad).toFixed(2)}</p>
                </div>

                <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Eliminar">
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Sección de Resumen y Pago */}
          <div className="cart-summary">
            <h2>Datos de Facturación</h2>

            <form onSubmit={handleCheckout} className="client-form">
              <div className="form-field">
                <label>Cédula de Identidad</label>
                <input
                  placeholder="1234567890"
                  value={cliente.cedula}
                  onChange={e => setCliente({ ...cliente, cedula: e.target.value })}
                  required
                  pattern="[0-9]{10}"
                  title="Cédula de 10 dígitos"
                />
              </div>

              <div className="form-field">
                <label>Nombre Completo</label>
                <input
                  placeholder="Juan Pérez"
                  value={cliente.nombre}
                  onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Correo Electrónico</label>
                <input
                  placeholder="juan@email.com"
                  type="email"
                  value={cliente.email}
                  onChange={e => setCliente({ ...cliente, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Teléfono Celular</label>
                <input
                  placeholder="0991234567"
                  value={cliente.telefono}
                  onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
                  required
                />
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>IVA (15%)</span>
                  <span>${(getTotal() * 0.15).toFixed(2)}</span>
                </div>
                <div className="total-row total-final">
                  <span>Total a Pagar</span>
                  <span>${(getTotal() * 1.15).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="checkout-btn" disabled={isProcessing}>
                {isProcessing ? 'Procesando...' : '💳 Pagar y Finalizar'}
              </button>

              <button type="button" className="continue-shopping-link" onClick={() => navigate('/')}>
                ← Seguir Comprando
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
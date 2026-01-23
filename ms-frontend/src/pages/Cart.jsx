import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { inventarioService } from '../services/inventarioService';
import { ventasService } from '../services/ventasService';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal, sucursalId } = useCart();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({ cedula: '', nombre: '', email: '', telefono: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!sucursalId) return alert('Selecciona sucursal en el Inicio');

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

      // La actualización del inventario ocurre en el backend cuando se procesa la venta
      // La alerta informa al usuario que esto ha sucedido
      alert('✅ Compra exitosa. El inventario ha sido actualizado.');
      clearCart();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('❌ Error al procesar la compra. Verifique el stock o intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
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
                  <span className="item-icon">💊</span>
                </div>

                <div className="item-details">
                  <h3>{item.nombre}</h3>
                  <p className="item-lab">{item.laboratorio}</p>
                  <p className="item-price">${item.precioUnitario.toFixed(2)}</p>
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
                <input
                  placeholder="Cédula de Identidad"
                  value={cliente.cedula}
                  onChange={e => setCliente({ ...cliente, cedula: e.target.value })}
                  required
                  pattern="[0-9]{10}"
                  title="Cédula de 10 dígitos"
                />
              </div>

              <div className="form-field">
                <input
                  placeholder="Nombre Completo"
                  value={cliente.nombre}
                  onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <input
                  placeholder="Correo Electrónico"
                  type="email"
                  value={cliente.email}
                  onChange={e => setCliente({ ...cliente, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <input
                  placeholder="Teléfono Celular"
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
                {isProcessing ? 'Procesando...' : 'Pagar y Finalizar'}
              </button>

              <button type="button" className="continue-shopping-link" onClick={() => navigate('/')}>
                Seguir Comprando
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
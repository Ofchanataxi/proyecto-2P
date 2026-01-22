import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { inventarioService } from '../services/inventarioService';
import { ventasService } from '../services/ventasService';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, clearCart, getTotal, sucursalId } = useCart();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({ cedula: '', nombre: '', email: '', telefono: '' });

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!sucursalId) return alert('Selecciona sucursal en el Inicio');

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
      await ventasService.createVenta(payload);
      alert('✅ Compra exitosa');
      clearCart();
      navigate('/');
    } catch (err) {
      alert('❌ Error al procesar la compra');
    }
  };

  if (cart.length === 0) return <div><h2>Carrito Vacío</h2><button onClick={() => navigate('/')}>Ir al inicio</button></div>;

  return (
    <div className="container">
      <h1>🛒 Tu Carrito</h1>
      <form onSubmit={handleCheckout}>
        <input placeholder="Cédula" onChange={e => setCliente({...cliente, cedula: e.target.value})} required />
        <input placeholder="Nombre" onChange={e => setCliente({...cliente, nombre: e.target.value})} required />
        <input placeholder="Email" onChange={e => setCliente({...cliente, email: e.target.value})} required />
        <div className="total">Total: ${getTotal().toFixed(2)}</div>
        <button type="submit">Finalizar Compra</button>
      </form>
    </div>
  );
};

export default Cart;
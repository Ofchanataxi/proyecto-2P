import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { inventarioService } from '../services/inventarioService';
import { ventasService } from '../services/ventasService';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, clearCart, getTotal, sucursalId } = useCart();
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cliente, setCliente] = useState({
    cedula: '',
    nombre: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    inventarioService.getAllSucursales().then(setSucursales).catch(console.error);
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!sucursalId) {
      alert('⚠️ Por favor selecciona una sucursal en el Inicio.');
      return;
    }
    
    setIsProcessing(true);
    try {
      // ESTRUCTURA EXACTA PARA TU VentaController
      const ventaPayload = {
        cliente: {
            cedula: cliente.cedula,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono
        },
        sucursalId: parseInt(sucursalId),
        detalles: cart.map(item => ({
            medicamentoId: item.id, // Asegúrate que en CartContext guardas 'id'
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario
        })),
        total: getTotal()
      };

      await ventasService.createVenta(ventaPayload);
      alert('✅ ¡Compra exitosa!');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('❌ Error en la compra. Revisa la consola.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSucursalName = () => {
    const s = sucursales.find(x => x.id === parseInt(sucursalId));
    return s ? s.nombre : 'No seleccionada';
  };

  if (cart.length === 0) return <div className="cart-page"><h2>🛒 Carrito Vacío</h2><button onClick={() => navigate('/')}>Volver</button></div>;

  return (
    <div className="cart-page">
      <div className="container">
        <h1>🛒 Finalizar Compra</h1>
        <div className="cart-summary">
            <h3>📍 Sucursal: {getSucursalName()}</h3>
            
            <form onSubmit={handleCheckout} className="client-form">
                <input placeholder="Cédula" value={cliente.cedula} onChange={e => setCliente({...cliente, cedula: e.target.value})} required maxLength="10"/>
                <input placeholder="Nombre" value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})} required />
                <input placeholder="Email" value={cliente.email} onChange={e => setCliente({...cliente, email: e.target.value})} required />
                <input placeholder="Teléfono" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})} required />
                
                <div className="total-row">
                    <h3>Total: ${getTotal().toFixed(2)}</h3>
                </div>
                
                <button type="submit" className="checkout-btn" disabled={isProcessing}>
                    {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
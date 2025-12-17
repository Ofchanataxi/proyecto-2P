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
  const [errors, setErrors] = useState({
    nombre: '',
    cedula: '',
    email: '',
    telefono: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const navigate = useNavigate();

  // Función para mostrar modal
  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ show: true, type, title, message, onConfirm });
  };

  // Función para cerrar modal
  const closeModal = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    setModal({ show: false, type: '', title: '', message: '', onConfirm: null });
  };

  // Función de validación de cédula ecuatoriana (algoritmo módulo 10)
  const validarCedulaEcuatoriana = (cedula) => {
    if (!cedula || cedula.trim() === '') return { valid: true, message: '' };

    cedula = cedula.trim();

    // Verificar que tenga 10 dígitos
    if (!/^\d{10}$/.test(cedula)) {
      return { valid: false, message: 'La cédula debe tener exactamente 10 dígitos numéricos' };
    }

    // Verificar que los dos primeros dígitos sean válidos (provincia 01-24)
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      return { valid: false, message: 'Los dos primeros dígitos deben estar entre 01 y 24' };
    }

    // Algoritmo módulo 10
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let digito = parseInt(cedula.charAt(i));
      let producto = digito * coeficientes[i];
      if (producto >= 10) {
        producto -= 9;
      }
      suma += producto;
    }

    const digitoVerificador = (10 - (suma % 10)) % 10;
    const ultimoDigito = parseInt(cedula.charAt(9));

    if (digitoVerificador !== ultimoDigito) {
      return { valid: false, message: 'Cédula ecuatoriana inválida (dígito verificador incorrecto)' };
    }

    return { valid: true, message: '' };
  };

  // Función de validación de teléfono ecuatoriano
  const validarTelefonoEcuatoriano = (telefono) => {
    if (!telefono || telefono.trim() === '') return { valid: true, message: '' };

    telefono = telefono.trim().replace(/[\s-]/g, '');

    // Verificar que tenga 10 dígitos
    if (!/^\d{10}$/.test(telefono)) {
      return { valid: false, message: 'El teléfono debe tener exactamente 10 dígitos' };
    }

    // Verificar que comience con un código válido
    const prefijo = telefono.substring(0, 2);
    const prefijoValidos = ['09', '02', '03', '04', '05', '06', '07'];

    if (!prefijoValidos.includes(prefijo)) {
      return { valid: false, message: 'El teléfono debe comenzar con 09 (celular) o 02-07 (fijo)' };
    }

    return { valid: true, message: '' };
  };

  // Función de validación de email
  const validarEmail = (email) => {
    if (!email || email.trim() === '') return { valid: true, message: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { valid: false, message: 'El email debe tener un formato válido (ejemplo@dominio.com)' };
    }

    return { valid: true, message: '' };
  };

  // Función de validación de nombre
  const validarNombre = (nombre) => {
    if (!nombre || nombre.trim() === '') {
      return { valid: false, message: 'El nombre es obligatorio' };
    }

    if (nombre.trim().length < 3) {
      return { valid: false, message: 'El nombre debe tener al menos 3 caracteres' };
    }

    return { valid: true, message: '' };
  };

  // Manejar cambios en los campos con validación en tiempo real
  const handleInputChange = (field, value) => {
    setClienteData({ ...clienteData, [field]: value });

    let validation = { valid: true, message: '' };

    switch (field) {
      case 'nombre':
        validation = validarNombre(value);
        break;
      case 'cedula':
        validation = validarCedulaEcuatoriana(value);
        break;
      case 'email':
        validation = validarEmail(value);
        break;
      case 'telefono':
        validation = validarTelefonoEcuatoriano(value);
        break;
      default:
        break;
    }

    setErrors({ ...errors, [field]: validation.message });
  };

  // Verificar si hay errores de validación
  const hasValidationErrors = () => {
    return Object.values(errors).some(error => error !== '');
  };

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
      showModal('error', '⚠️ Carrito Vacío', 'No hay productos en tu carrito. Agrega algunos productos antes de continuar.');
      return;
    }

    if (!sucursalId) {
      showModal('error', '⚠️ Sucursal Requerida', 'Por favor selecciona una sucursal antes de finalizar tu compra.');
      return;
    }

    // Validar todos los campos
    const nombreValidation = validarNombre(clienteData.nombre);
    const cedulaValidation = validarCedulaEcuatoriana(clienteData.cedula);
    const emailValidation = validarEmail(clienteData.email);
    const telefonoValidation = validarTelefonoEcuatoriano(clienteData.telefono);

    if (!nombreValidation.valid || !cedulaValidation.valid) {
      const errorMessages = [];
      if (!nombreValidation.valid) errorMessages.push(`• ${nombreValidation.message}`);
      if (!cedulaValidation.valid) errorMessages.push(`• ${cedulaValidation.message}`);

      showModal('error', '❌ Datos Incompletos',
        'Por favor completa correctamente los siguientes campos obligatorios:\n\n' + errorMessages.join('\n'));

      setErrors({
        nombre: nombreValidation.message,
        cedula: cedulaValidation.message,
        email: emailValidation.message,
        telefono: telefonoValidation.message,
      });
      return;
    }

    if (!emailValidation.valid || !telefonoValidation.valid) {
      const errorMessages = [];
      if (!emailValidation.valid) errorMessages.push(`• ${emailValidation.message}`);
      if (!telefonoValidation.valid) errorMessages.push(`• ${telefonoValidation.message}`);

      showModal('error', '❌ Datos Inválidos',
        'Por favor corrige los siguientes errores:\n\n' + errorMessages.join('\n'));

      setErrors({
        nombre: nombreValidation.message,
        cedula: cedulaValidation.message,
        email: emailValidation.message,
        telefono: telefonoValidation.message,
      });
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

      // Mostrar modal de éxito y redirigir después
      showModal('success', '✅ ¡Venta Realizada con Éxito!',
        `Tu compra ha sido procesada correctamente.\n\nTotal: $${getTotal().toFixed(2)}\nID de Venta: ${response.id || 'N/A'}\n\n¡Gracias por tu compra!`,
        () => {
          // Limpiar carrito y formulario
          clearCart();
          setClienteData({ nombre: '', cedula: '', email: '', telefono: '' });
          setErrors({ nombre: '', cedula: '', email: '', telefono: '' });
          // Redirigir al home
          navigate('/');
        }
      );
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
      showModal('error', '❌ Error al Procesar la Venta',
        `No se pudo completar tu compra. Por favor intenta nuevamente.\n\nDetalle: ${errorMsg}`);
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
                <div className="form-field">
                  <input
                    type="text"
                    placeholder="Nombre completo *"
                    value={clienteData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className={errors.nombre ? 'input-error' : clienteData.nombre ? 'input-valid' : ''}
                    required
                  />
                  {errors.nombre && <span className="error-message">❌ {errors.nombre}</span>}
                </div>

                <div className="form-field">
                  <input
                    type="text"
                    placeholder="Cédula ecuatoriana (10 dígitos) *"
                    value={clienteData.cedula}
                    onChange={(e) => handleInputChange('cedula', e.target.value)}
                    className={errors.cedula ? 'input-error' : clienteData.cedula && !errors.cedula ? 'input-valid' : ''}
                    maxLength="10"
                    required
                  />
                  {errors.cedula && <span className="error-message">❌ {errors.cedula}</span>}
                  {!errors.cedula && clienteData.cedula && <span className="success-message">✅ Cédula válida</span>}
                </div>

                <div className="form-field">
                  <input
                    type="email"
                    placeholder="Email (opcional)"
                    value={clienteData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'input-error' : clienteData.email && !errors.email ? 'input-valid' : ''}
                  />
                  {errors.email && <span className="error-message">❌ {errors.email}</span>}
                  {!errors.email && clienteData.email && <span className="success-message">✅ Email válido</span>}
                </div>

                <div className="form-field">
                  <input
                    type="tel"
                    placeholder="Teléfono ecuatoriano (10 dígitos, ej: 0987654321)"
                    value={clienteData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={errors.telefono ? 'input-error' : clienteData.telefono && !errors.telefono ? 'input-valid' : ''}
                    maxLength="10"
                  />
                  {errors.telefono && <span className="error-message">❌ {errors.telefono}</span>}
                  {!errors.telefono && clienteData.telefono && <span className="success-message">✅ Teléfono válido</span>}
                </div>
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
              disabled={isProcessing || !sucursalId || hasValidationErrors() || !clienteData.nombre || !clienteData.cedula}
            >
              {isProcessing ? '⏳ Procesando...' : '✅ Finalizar Compra'}
            </button>

            <button onClick={() => navigate('/')} className="continue-shopping-link">
              ← Seguir Comprando
            </button>
          </div>
        </div>

        {/* Modal Personalizado */}
        {modal.show && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className={`modal-content modal-${modal.type}`} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modal.title}</h2>
              </div>
              <div className="modal-body">
                <p style={{ whiteSpace: 'pre-line' }}>{modal.message}</p>
              </div>
              <div className="modal-footer">
                <button onClick={closeModal} className={`modal-btn modal-btn-${modal.type}`}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

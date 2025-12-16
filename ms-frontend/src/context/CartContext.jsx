import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [sucursalId, setSucursalId] = useState(null);

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedSucursal = localStorage.getItem('sucursalId');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedSucursal) {
      setSucursalId(parseInt(savedSucursal));
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Guardar sucursal en localStorage
  useEffect(() => {
    if (sucursalId) {
      localStorage.setItem('sucursalId', sucursalId.toString());
    }
  }, [sucursalId]);

  const addToCart = (medicamento, cantidad = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === medicamento.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === medicamento.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prevCart, { ...medicamento, cantidad }];
    });
  };

  const removeFromCart = (medicamentoId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== medicamentoId));
  };

  const updateQuantity = (medicamentoId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(medicamentoId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === medicamentoId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.cantidad, 0);
  };

  const selectSucursal = (id) => {
    setSucursalId(id);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        sucursalId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        selectSucursal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

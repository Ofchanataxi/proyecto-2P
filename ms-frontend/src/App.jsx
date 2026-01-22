import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Sucursales from './pages/Sucursales';
import Login from './pages/Login';
import MedicHome from './pages/MedicHome';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Home />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/categorias/:categoria" 
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Home />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/carrito" 
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/sucursales" 
                  element={
                    <ProtectedRoute>
                      <Sucursales />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/medico" 
                  element={
                    <ProtectedRoute requiredRole="MEDICO">
                      <MedicHome />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

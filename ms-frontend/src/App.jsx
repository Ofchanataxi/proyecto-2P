import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Admin from './pages/Admin'
import Sucursales from './pages/Sucursales'
import './App.css'
import { useAuth } from "react-oidc-context";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 1. PANTALLA DE CARGA (Evita el blanco mientras verifica sesión)
  if (auth.isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <h2>Cargando Farmacia Online...</h2>
          </div>
      );
  }

  // 2. PANTALLA DE ERROR (Si no conecta con OAuth)
  if (auth.error) {
      return (
          <div style={{ padding: '20px', color: 'red' }}>
              <h2>Error de Autenticación: {auth.error.message}</h2>
              <button onClick={() => auth.signinRedirect()}>Reintentar Login</button>
          </div>
      );
  }

  // 3. PANTALLA DE LOGIN (Si no está autenticado)
  if (!auth.isAuthenticated) {
      return (
          <div className="login-container" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100vh',
              backgroundColor: '#f0f2f5' 
          }}>
              <h1>Bienvenido a Farmacia Online</h1>
              <p>Por favor inicia sesión para continuar</p>
              <button 
                  onClick={() => auth.signinRedirect()}
                  style={{
                      padding: '10px 20px',
                      fontSize: '16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                  }}
              >
                  Iniciar Sesión
              </button>
          </div>
      );
  }

  // 4. APP PRINCIPAL (Solo se renderiza si está logueado)
  return (
    <Router>
      <div className="app-container">
        {/* Pasamos el objeto auth al Header si lo necesita, o mostramos botón de salir aquí */}
        <Header toggleMenu={toggleMenu} />
        
        {/* Botón temporal de Logout para pruebas */}
        <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 1000 }}>
             <button onClick={() => auth.removeUser()} style={{ background: 'red', color: 'white' }}>
                Cerrar Sesión ({auth.user?.profile.sub})
             </button>
        </div>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/sucursales" element={<Sucursales />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
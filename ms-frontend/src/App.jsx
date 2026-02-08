import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Sucursales from './pages/Sucursales'
import LoginPage, { LoginLoading, LoginError } from './pages/Login'
import './App.css'
import { useAuth } from './context/AuthContext'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 1. PANTALLA DE CARGA (Evita el blanco mientras verifica sesión)
  if (auth.isLoading) {
    return <LoginLoading />;
  }

  // 2. PANTALLA DE ERROR (Si no conecta con OAuth)
  if (auth.error) {
    return (
      <LoginError
        message={auth.error.message}
        onRetry={() => auth.signinRedirect()}
      />
    );
  }

  // 3. PANTALLA DE LOGIN (Si no está autenticado)
  if (!auth.isAuthenticated) {
    return (
      <LoginPage
        onLogin={() => auth.signinRedirect()}
        error={null}
        isRetrying={false}
      />
    );
  }

  // 4. APP PRINCIPAL (Solo se renderiza si está logueado)
  return (
    <Router>
      <div className="app-container">
        {/* Pasar auth al Header para mostrar info del usuario y logout */}
        <Header toggleMenu={toggleMenu} auth={auth} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categorias/:categoria" element={<Home />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/sucursales" element={<Sucursales />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
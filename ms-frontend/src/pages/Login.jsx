import './Login.css';

/**
 * LoginPage - Página de login estilo Instagram para Farmacia Online
 * Diseño premium con imágenes de farmacia y autenticación OAuth
 */
function LoginPage({ onLogin, error, isRetrying }) {
  return (
    <div className="login-page">
      {/* ======== LADO IZQUIERDO - SHOWCASE VISUAL ======== */}
      <div className="login-showcase">
        {/* Emojis flotantes decorativos */}
        <div className="floating-emojis">
          <span className="emoji">💊</span>
          <span className="emoji">🏥</span>
          <span className="emoji">💉</span>
          <span className="emoji">🩺</span>
          <span className="emoji">❤️</span>
        </div>

        <div className="showcase-content">
          {/* Logo de la farmacia */}
          <div className="pharmacy-logo">
            <span className="logo-icon">💊</span>
            <h1>Farmacia Online</h1>
          </div>

          {/* Tagline principal */}
          <h2 className="showcase-tagline">
            Tu salud es nuestra <span className="highlight">prioridad</span>
          </h2>

          <p className="showcase-subtitle">
            Medicamentos, cuidado personal y atención profesional desde cualquier lugar
          </p>

          {/* Galería de imágenes estilo Instagram */}
          <div className="image-gallery">
            <div className="gallery-item">
              <img src="/pharmacy-1.png" alt="Interior de farmacia moderna" />
            </div>
            <div className="gallery-item">
              <img src="/pharmacy-2.png" alt="Atención farmacéutica profesional" />
            </div>
            <div className="gallery-item">
              <img src="/pharmacy-3.png" alt="Servicio al cliente" />
            </div>
          </div>
        </div>
      </div>

      {/* ======== LADO DERECHO - FORMULARIO DE LOGIN ======== */}
      <div className="login-form-container">
        <div className="login-card">
          {/* Header del formulario */}
          <div className="login-header">
            <h2>Iniciar Sesión</h2>
            <p>Accede a tu cuenta para gestionar tus pedidos</p>
          </div>

          {/* Información de OAuth */}
          <div className="oauth-info">
            <span className="oauth-info-icon">🔐</span>
            <p>
              Utilizamos autenticación segura OAuth 2.0 para proteger tu información
            </p>
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div className="login-error-inline" style={{
              background: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Botón principal de Login */}
          <button
            className="login-button"
            onClick={onLogin}
            disabled={isRetrying}
          >
            <span className="login-button-icon">🔑</span>
            {isRetrying ? 'Conectando...' : 'Iniciar Sesión con OAuth'}
          </button>

          {/* Separador */}
          <div className="login-divider">
            <span>Beneficios</span>
          </div>

          {/* Features / Beneficios */}
          <div className="login-features">
            <div className="feature-item">
              <span className="feature-icon">🛒</span>
              <span className="feature-text">Gestiona tu carrito de compras</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📦</span>
              <span className="feature-text">Seguimiento de tus pedidos en tiempo real</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-text">Ofertas y descuentos exclusivos</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏪</span>
              <span className="feature-text">Múltiples sucursales a tu servicio</span>
            </div>
          </div>

          {/* Footer del login */}
          <div className="login-footer">
            <p>Al iniciar sesión, aceptas nuestros términos y condiciones</p>
            <div className="footer-links">
              <a href="#">Términos de uso</a>
              <a href="#">Política de privacidad</a>
              <a href="#">Ayuda</a>
            </div>
            <div className="company-badge">
              <span>Farmacia Online</span> © 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LoginLoading - Pantalla de carga mientras se verifica la sesión
 */
export function LoginLoading() {
  return (
    <div className="login-loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">Cargando Farmacia Online...</p>
    </div>
  );
}

/**
 * LoginError - Pantalla de error de autenticación
 */
export function LoginError({ message, onRetry }) {
  return (
    <div className="login-error">
      <span className="error-icon">⚠️</span>
      <h2 className="error-title">Error de Autenticación</h2>
      <p className="error-message">{message}</p>
      <button className="retry-button" onClick={onRetry}>
        Reintentar Login
      </button>
    </div>
  );
}

export default LoginPage;

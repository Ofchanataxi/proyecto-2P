import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
  authority: "http://localhost:9000",
  client_id: "farmacia-frontend",
  // Usamos window.location.origin para que sea dinámico (http://localhost:3000)
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile read write",
  // Esta función maneja automáticamente el código de autorización en la URL
  onSigninCallback: () => {
      // Limpia la URL quitando el ?code=...
      window.history.replaceState({}, document.title, window.location.pathname);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
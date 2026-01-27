import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
  authority: (import.meta.env.VITE_OIDC_AUTHORITY || "http://34.130.207.184:9000"),
  client_id: "farmacia-frontend",
  redirect_uri: window.location.origin + "/",
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile read write",
  automaticSilentRenew: false,
  loadUserInfo: true,
  // FORZAR DESACTIVACIÓN DE PKCE para HTTP (sin HTTPS)
  // react-oidc-context intenta PKCE si el servidor lo soporta,
  // pero falla en HTTP porque Crypto.subtle no está disponible
  metadata: {
    // Metadata básica que será combinada con la del servidor
    code_challenge_methods_supported: []  // Indica que NO se soporta PKCE
  },
  onSigninCallback: () => {
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
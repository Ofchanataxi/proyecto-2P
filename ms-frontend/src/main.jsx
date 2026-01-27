import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
  authority: (import.meta.env.VITE_OIDC_AUTHORITY || "http://34.130.207.184:9000"),
  client_id: "farmacia-frontend",
  // Usar location completo con trailing slash para coincidir con backend
  redirect_uri: window.location.origin + "/",
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile read write",
  // Activar PKCE automáticamente (react-oidc-context lo maneja)
  automaticSilentRenew: false,
  loadUserInfo: true,
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
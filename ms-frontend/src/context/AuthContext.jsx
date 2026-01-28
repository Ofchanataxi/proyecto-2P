import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Configuración OAuth
const OAUTH_CONFIG = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY || 'http://34.130.32.93:9000',
  client_id: 'farmacia-frontend',
  redirect_uri: window.location.origin + '/',
  response_type: 'code',
  scope: 'openid profile read write',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('access_token');
        const userInfo = localStorage.getItem('user_info');
        
        if (token && userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error cargando usuario:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Manejar callback de OAuth (código de autorización)
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        setIsLoading(true);
        try {
          // Intercambiar código por token (cliente público - sin autenticación)
          const tokenResponse = await fetch(`${OAUTH_CONFIG.authority}/oauth2/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include', // IMPORTANTE: Incluir cookies de sesión
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: OAUTH_CONFIG.redirect_uri,
              client_id: OAUTH_CONFIG.client_id,
              client_secret: '', // Cliente público con secret vacío
            }),
          });

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Error obteniendo token:', errorText);
            throw new Error('Error obteniendo token');
          }

          const tokenData = await tokenResponse.json();
          
          // Guardar tokens
          localStorage.setItem('access_token', tokenData.access_token);
          if (tokenData.refresh_token) {
            localStorage.setItem('refresh_token', tokenData.refresh_token);
          }

          // Obtener información del usuario
          const userInfoResponse = await fetch(`${OAUTH_CONFIG.authority}/userinfo`, {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
            credentials: 'include', // Incluir cookies
          });

          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            setUser(userInfo);
            setIsAuthenticated(true);
          } else {
            console.error('Error obteniendo userinfo');
          }

          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Error en OAuth callback:', err);
          setError(err);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  // Iniciar login (redirigir a OAuth)
  const signinRedirect = () => {
    console.log('🔐 Iniciando login OAuth...');
    console.log('Authority:', OAUTH_CONFIG.authority);
    
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    const authUrl = new URL(`${OAUTH_CONFIG.authority}/oauth2/authorize`);
    authUrl.searchParams.append('response_type', OAUTH_CONFIG.response_type);
    authUrl.searchParams.append('client_id', OAUTH_CONFIG.client_id);
    authUrl.searchParams.append('redirect_uri', OAUTH_CONFIG.redirect_uri);
    authUrl.searchParams.append('scope', OAUTH_CONFIG.scope);
    authUrl.searchParams.append('state', state);

    console.log('🔗 Redirigiendo a:', authUrl.toString());
    window.location.href = authUrl.toString();
  };

  // Logout
  const signoutRedirect = () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setIsAuthenticated(false);

    // Redirigir a logout de OAuth
    const logoutUrl = new URL(`${OAUTH_CONFIG.authority}/logout`);
    logoutUrl.searchParams.append('post_logout_redirect_uri', window.location.origin);
    window.location.href = logoutUrl.toString();
  };

  // Remover usuario (logout local)
  const removeUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: signinRedirect, // Alias para compatibilidad
    signinRedirect,
    logout: signoutRedirect, // Alias para compatibilidad
    signoutRedirect,
    removeUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

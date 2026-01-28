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
  authority: import.meta.env.VITE_OIDC_AUTHORITY || 'http://localhost:9000',
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
          // Recuperar code_verifier de PKCE
          const codeVerifier = sessionStorage.getItem('code_verifier');
          if (!codeVerifier) {
            console.error('code_verifier not found in sessionStorage');
            throw new Error('PKCE code_verifier missing');
          }
          
          // Intercambiar código por token usando PKCE
          const tokenResponse = await fetch(`${OAUTH_CONFIG.authority}/oauth2/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: OAUTH_CONFIG.redirect_uri,
              client_id: OAUTH_CONFIG.client_id,
              code_verifier: codeVerifier, // PKCE code_verifier
            }),
          });

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Error obteniendo token:', errorText);
            throw new Error('Error obteniendo token');
          }

          const tokenData = await tokenResponse.json();
          
          // Limpiar code_verifier después de usarlo
          sessionStorage.removeItem('code_verifier');
          
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

  // Funciones PKCE
  function base64URLEncode(buffer) {
    return btoa(String.fromCharCode.apply(null, buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
  }

  // SHA-256 implementation para contextos no-HTTPS
  async function sha256(plain) {
    // Intentar usar crypto.subtle si está disponible (HTTPS o localhost)
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(plain);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return new Uint8Array(hash);
    }
    
    // Fallback: usar implementación pura JS para HTTP
    // Implementación simple de SHA-256
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j;
    let result = '';
    
    const words = [];
    const asciiBitLength = plain[lengthProperty] * 8;
    
    let hash = sha256.h = sha256.h || [];
    const k = sha256.k = sha256.k || [];
    let primeCounter = k[lengthProperty];
    
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    
    plain += '\x80';
    while (plain[lengthProperty] % 64 - 56) plain += '\x00';
    for (i = 0; i < plain[lengthProperty]; i++) {
      j = plain.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);
    
    for (j = 0; j < words[lengthProperty];) {
      const w = words.slice(j, j += 16);
      const oldHash = hash;
      hash = hash.slice(0, 8);
      
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        
        const a = hash[0], e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0
          );
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    
    const hashArray = new Uint8Array(32);
    for (i = 0; i < 8; i++) {
      for (j = 0; j < 4; j++) {
        hashArray[i * 4 + j] = (hash[i] >>> (24 - j * 8)) & 0xff;
      }
    }
    
    return hashArray;
  }

  async function generateCodeChallenge(verifier) {
    const hash = await sha256(verifier);
    return base64URLEncode(hash);
  }

  // Iniciar login (redirigir a OAuth con PKCE)
  const signinRedirect = async () => {
    console.log('🔐 Iniciando login OAuth con PKCE...');
    console.log('Authority:', OAUTH_CONFIG.authority);
    
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    // Generar PKCE code_verifier y code_challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Guardar code_verifier en sessionStorage
    sessionStorage.setItem('code_verifier', codeVerifier);
    
    console.log('✅ PKCE code_verifier generado y guardado');
    console.log('✅ PKCE code_challenge generado:', codeChallenge.substring(0, 20) + '...');

    const authUrl = new URL(`${OAUTH_CONFIG.authority}/oauth2/authorize`);
    authUrl.searchParams.append('response_type', OAUTH_CONFIG.response_type);
    authUrl.searchParams.append('client_id', OAUTH_CONFIG.client_id);
    authUrl.searchParams.append('redirect_uri', OAUTH_CONFIG.redirect_uri);
    authUrl.searchParams.append('scope', OAUTH_CONFIG.scope);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

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

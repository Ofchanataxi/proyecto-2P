import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const loadUser = async () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();

      if (token && savedUser) {
        try {
          // Validar el token
          const validation = await authService.validateToken(token, savedUser.username);
          if (validation.valid) {
            setUser(savedUser);
          } else {
            authService.logout();
          }
        } catch (error) {
          console.error('Error validando token:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const userData = {
        username: response.username,
        email: response.email,
        rol: response.rol,
      };
      authService.setUserSession(response.token, userData);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password, rol) => {
    try {
      const response = await authService.register(username, email, password, rol);
      const userData = {
        username: response.username,
        email: response.email,
        rol: response.rol,
      };
      authService.setUserSession(response.token, userData);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.rol === 'ADMIN';
  };

  const isMedico = () => {
    return user?.rol === 'MEDICO';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    isMedico,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

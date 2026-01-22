import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await register(
          formData.username,
          formData.email,
          formData.password,
          selectedRole
        );
      } else {
        result = await login(formData.username, formData.password);
      }

      if (result.success) {
        // Redirigir según el rol
        if (selectedRole === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/medico');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setFormData({ username: '', email: '', password: '' });
    setError('');
    setIsRegister(false);
  };

  if (!selectedRole) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Farmacia Online</h1>
          <p className="subtitle">Selecciona tu tipo de usuario</p>
          
          <div className="role-buttons">
            <button
              className="role-button admin"
              onClick={() => handleRoleSelect('ADMIN')}
            >
              <i className="icon">👨‍💼</i>
              <h3>Administrador</h3>
              <p>Gestión completa del sistema</p>
            </button>

            <button
              className="role-button medico"
              onClick={() => handleRoleSelect('MEDICO')}
            >
              <i className="icon">👨‍⚕️</i>
              <h3>Médico</h3>
              <p>Realizar compras de medicamentos</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <button className="back-button" onClick={handleBack}>
          ← Volver
        </button>

        <h1>{isRegister ? 'Registro' : 'Iniciar Sesión'}</h1>
        <p className="subtitle">
          {selectedRole === 'ADMIN' ? 'Administrador' : 'Médico'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Ingresa tu usuario"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="correo@ejemplo.com"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="toggle-form">
          <p>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="link-button"
            >
              {isRegister ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

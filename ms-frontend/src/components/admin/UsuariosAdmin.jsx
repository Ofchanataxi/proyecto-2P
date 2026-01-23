import React, { useState, useEffect } from 'react';
import usuarioService from '../../services/usuarioService';
import './AdminTables.css';

const UsuariosAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'USER',
        enabled: true
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadUsuarios();
    }, []);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setError(null);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const showError = (message) => {
        setError(message);
        setSuccessMessage('');
        setTimeout(() => setError(null), 5000);
    };

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await usuarioService.getAllUsuarios();
            setUsuarios(data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            const msg = error.response?.status === 403 
                ? 'No tienes permisos de administrador para ver los usuarios' 
                : 'Error al cargar usuarios: ' + (error.response?.data?.message || error.message);
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await usuarioService.updateUsuario(editingId, formData);
                showSuccess('✅ Usuario actualizado correctamente');
            } else {
                await usuarioService.createUsuario(formData);
                showSuccess('✅ Usuario creado correctamente');
            }
            resetForm();
            loadUsuarios();
        } catch (error) {
            console.error('Error:', error);
            const msg = error.response?.data?.message || 'Error al guardar usuario';
            showError('❌ ' + msg);
        }
    };

    const handleEdit = (user) => {
        setFormData({
            username: user.username,
            password: '',
            role: user.role,
            enabled: user.enabled
        });
        setEditingId(user.id);
        setError(null);
        setSuccessMessage('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
        try {
            await usuarioService.deleteUsuario(id);
            showSuccess('✅ Usuario eliminado correctamente');
            loadUsuarios();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            showError('❌ Error al eliminar usuario');
        }
    };

    const resetForm = () => {
        setFormData({ username: '', password: '', role: 'USER', enabled: true });
        setEditingId(null);
    };

    return (
        <div className="admin-section">
            <h2>👥 Gestión de Usuarios</h2>

            {/* Mensajes de estado */}
            {error && (
                <div style={{ 
                    background: '#f8d7da', 
                    color: '#721c24', 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    border: '1px solid #f5c6cb'
                }}>
                    {error}
                </div>
            )}
            {successMessage && (
                <div style={{ 
                    background: '#d4edda', 
                    color: '#155724', 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    border: '1px solid #c3e6cb'
                }}>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#003d7a' }}>
                    {editingId ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                </h3>
                <div className="form-grid">
                    <input
                        placeholder="Nombre de Usuario *"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        required
                        disabled={editingId}
                        style={editingId ? { background: '#e9ecef' } : {}}
                    />
                    <input
                        type="password"
                        placeholder={editingId ? "Nueva Contraseña (dejar vacío para mantener)" : "Contraseña *"}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required={!editingId}
                    />
                    <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="USER">👤 Usuario</option>
                        <option value="ADMIN">🔑 Administrador</option>
                    </select>

                    <label className="checkbox-label" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: 'white', 
                        padding: '10px 15px', 
                        borderRadius: '8px', 
                        border: '2px solid #e0e0e0',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                            style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500' }}>
                            {formData.enabled ? '✅ Cuenta Activa' : '❌ Cuenta Inactiva'}
                        </span>
                    </label>
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn-submit">
                        {editingId ? '💾 Actualizar Usuario' : '➕ Crear Usuario'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="btn-cancel">
                            ❌ Cancelar
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    Cargando usuarios...
                </div>
            ) : usuarios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
                    No hay usuarios registrados
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td><strong>{u.username}</strong></td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: (u.role === 'ADMIN' ? '#d1e7dd' : '#cfe2ff'),
                                            color: (u.role === 'ADMIN' ? '#0f5132' : '#084298'),
                                            fontSize: '0.85em',
                                            fontWeight: 'bold'
                                        }}>
                                            {u.role === 'ADMIN' ? '🔑 ADMIN' : '👤 USER'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: u.enabled ? '#d1e7dd' : '#f8d7da',
                                            color: u.enabled ? '#0f5132' : '#721c24',
                                            fontSize: '0.85em',
                                            fontWeight: 'bold'
                                        }}>
                                            {u.enabled ? '✅ Activo' : '❌ Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleEdit(u)} 
                                            className="btn-secondary"
                                            style={{ padding: '6px 12px', marginRight: '8px' }}
                                            title="Editar usuario"
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(u.id)} 
                                            className="btn-cancel"
                                            style={{ padding: '6px 12px' }}
                                            title="Eliminar usuario"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UsuariosAdmin;

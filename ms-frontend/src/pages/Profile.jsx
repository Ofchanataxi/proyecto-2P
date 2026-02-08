import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import usuarioService from '../services/usuarioService';
import './Profile.css';

const Profile = () => {
    const { user, isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', type: 'success' });
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    // User Data State
    const [userInfo, setUserInfo] = useState({
        username: '',
        role: 'USER',
        id: null
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            const userName = user.preferred_username || user.username || user.sub || 'Usuario';

            // Detect role
            let role = 'USER';
            const roleClaim = user.role || user.roles || user.authorities;
            if (roleClaim) {
                const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
                if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) role = 'ADMIN';
                else role = roles[0] || 'USER';
            }
            if (userName === 'admin') role = 'ADMIN';

            setUserInfo({
                username: userName,
                role: role,
                id: user.sub // Assuming sub is ID, or we fetch from API
            });

            // Load saved profile image
            const savedImage = localStorage.getItem(`profile_image_${userName}`);
            if (savedImage) setPreviewImage(savedImage);
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setModalInfo({ isOpen: true, message: '❌ La imagen debe ser menor a 2MB', type: 'error' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setProfileImage(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            if (previewImage) {
                localStorage.setItem(`profile_image_${userInfo.username}`, previewImage);
                setModalInfo({ isOpen: true, message: '✅ Foto de perfil guardada correctamente', type: 'success' });
                setProfileImage(null); // Reset so button hides after save
            }
        } catch (error) {
            console.error(error);
            setModalInfo({ isOpen: true, message: '❌ Error al guardar la foto', type: 'error' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setModalInfo({ isOpen: true, message: '❌ Las contraseñas no coinciden', type: 'error' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setModalInfo({ isOpen: true, message: '❌ La contraseña debe tener al menos 6 caracteres', type: 'error' });
            return;
        }

        // Mock Password Change
        setModalInfo({ isOpen: true, message: '✅ Solicitud de cambio de contraseña enviada.', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="not-authenticated">
                        <h2>Acceso Requerido</h2>
                        <button onClick={() => navigate('/login')} className="btn-login">Iniciar Sesión</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Modal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
                message={modalInfo.message}
                type={modalInfo.type}
            />

            <div className="container">
                <button onClick={() => navigate(-1)} className="back-btn">← Volver</button>

                <div className="profile-header">
                    <h1>👤 Mi Perfil</h1>
                    <p>Gestiona tu información de cuenta</p>
                </div>

                <div className="profile-content">
                    {/* Photo Section */}
                    <div className="profile-card photo-card">
                        <h3>📷 Foto de Perfil</h3>
                        <div className="photo-container">
                            {previewImage ? (
                                <img src={previewImage} alt="Perfil" className="profile-photo" />
                            ) : (
                                <div className="photo-placeholder"><span>👤</span></div>
                            )}
                        </div>
                        <div className="photo-actions">
                            <label className="upload-btn">
                                📁 Seleccionar Imagen
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            </label>
                            {profileImage && (
                                <button onClick={handleSaveProfile} className="save-btn">
                                    💾 Guardar Foto
                                </button>
                            )}
                        </div>
                        <p className="photo-hint">Formatos: JPG, PNG. Máximo 2MB</p>
                    </div>

                    {/* Info Section */}
                    <div className="profile-card info-card">
                        <h3>ℹ️ Información de Cuenta</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Usuario</label>
                                <span className="info-value">{userInfo.username}</span>
                                <small className="hint-text">El nombre de usuario no se puede modificar.</small>
                            </div>

                            <div className="info-item">
                                <label>Rol Asignado</label>
                                <span className={`role-badge ${userInfo.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                                    {userInfo.role === 'ADMIN' ? '🔧 Administrador' : '👤 Usuario (Cliente)'}
                                </span>
                                <small className="hint-text">Solo un administrador puede modificar tu rol.</small>
                            </div>

                            <div className="info-item">
                                <label>Estado de Cuenta</label>
                                <span className="status-badge active">✅ Activo</span>
                            </div>

                            <div className="info-item">
                                <label>Sesión</label>
                                <span className="info-value">🟢 Conectado</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="profile-card security-card">
                        <h3>🔒 Seguridad</h3>
                        {!showPasswordSection ? (
                            <button onClick={() => setShowPasswordSection(true)} className="change-password-btn">
                                🔑 Cambiar Contraseña
                            </button>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="password-form">
                                <div className="form-group">
                                    <label>Contraseña Actual</label>
                                    <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Nueva Contraseña</label>
                                    <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength={6} />
                                </div>
                                <div className="form-group">
                                    <label>Confirmar Nueva Contraseña</label>
                                    <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
                                </div>
                                <div className="password-actions">
                                    <button type="submit" className="save-btn">Actualizar Contraseña</button>
                                    <button type="button" onClick={() => setShowPasswordSection(false)} className="cancel-btn">Cancelar</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

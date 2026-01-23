import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, message, type = 'success', onConfirm }) => {
    if (!isOpen) return null;

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    {type === 'success' && <div className="modal-icon-success">✓</div>}
                    {type === 'confirm' && <div className="modal-icon-warning">?</div>}
                    {type === 'error' && <div className="modal-icon-error">!</div>}
                    <span>{message}</span>
                </div>

                <div className="modal-divider"></div>

                <div className="modal-footer">
                    {type === 'confirm' ? (
                        <>
                            <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
                            <button className="modal-btn-confirm" onClick={onConfirm}>Confirmar</button>
                        </>
                    ) : (
                        <button className="modal-close-btn" onClick={onClose}>
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;

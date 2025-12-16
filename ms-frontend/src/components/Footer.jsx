import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>Acerca de Nosotros</h3>
              <ul>
                <li><Link to="/nosotros">Quiénes Somos</Link></li>
                <li><Link to="/mision">Nuestra Misión</Link></li>
                <li><Link to="/sucursales">Nuestras Sucursales</Link></li>
                <li><Link to="/trabaja">Trabaja con Nosotros</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Ayuda</h3>
              <ul>
                <li><Link to="/preguntas">Preguntas Frecuentes</Link></li>
                <li><Link to="/envios">Envíos y Entregas</Link></li>
                <li><Link to="/devoluciones">Devoluciones</Link></li>
                <li><Link to="/terminos">Términos y Condiciones</Link></li>
                <li><Link to="/privacidad">Política de Privacidad</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Servicio al Cliente</h3>
              <ul>
                <li>📞 1800-FARMACIA</li>
                <li>📧 info@farmacia.com</li>
                <li>💬 WhatsApp: +593 99 123 4567</li>
                <li>⏰ Atención 24/7</li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Síguenos</h3>
              <div className="social-links">
                <a href="#" className="social-link">📘 Facebook</a>
                <a href="#" className="social-link">📷 Instagram</a>
                <a href="#" className="social-link">🐦 Twitter</a>
                <a href="#" className="social-link">💼 LinkedIn</a>
              </div>
              <div className="payment-methods">
                <h4>Métodos de Pago</h4>
                <p>💳 Visa • Mastercard • American Express</p>
                <p>💰 Efectivo en Entrega</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2025 Farmacia Online. Todos los derechos reservados.</p>
          <p>🔒 Compra Segura | ✅ Productos Certificados</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

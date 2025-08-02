 // src/pages/Contact.jsx
import React from 'react';

export default function Contact() {
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '500px', borderRadius: '20px' }}>
        <h2 className="text-center mb-4">
          <i className="fa-solid fa-paper-plane me-2 text-warning"></i> Contáctanos
        </h2>

        <form>
           {/* Nombre */}
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="fas fa-user"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre completo"
            />
          </div>

          {/* Correo */}
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              className="form-control"
              placeholder="Correo electrónico"
            />
          </div>

          {/* Mensaje */}
          <div className="mb-4 input-group">
            <span className="input-group-text">
              <i className="fas fa-comment-dots"></i>
            </span>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Escribe tu mensaje..."
            ></textarea>
          </div>

          <button type="submit" className="btn btn-login d-block mx-auto">
            <i className="fa-solid fa-paper-plane me-2"></i> Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

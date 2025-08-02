import React from "react";

export const Trips = () => {
  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Planifica tu viaje</h2>

      <div className="row">
        {/* Formulario principal */}
        <div className="col-lg-6">
          <form>
            {/* Nombre del viaje */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-suitcase-rolling"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del viaje"
              />
            </div>

            {/* Destino */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-map-marker-alt"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Destino"
              />
            </div>

            {/* Fecha inicio */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-calendar-alt"></i>
              </span>
              <input type="date" className="form-control" />
            </div>

            {/* Fecha fin */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-calendar-check"></i>
              </span>
              <input type="date" className="form-control" />
            </div>

            {/* Descripción */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-align-left"></i>
              </span>
              <textarea
                className="form-control"
                placeholder="Descripción del viaje"
                rows="3"
              ></textarea>
            </div>

            {/* Botón */}
            <div className="text-center">
              <button className="btn btn-login px-4" type="submit">
                <i className="fas fa-plus-circle me-2"></i>
                Crear viaje
              </button>
            </div>
          </form>
        </div>

        {/* Mapa de Google */}
        <div className="col-lg-6 mt-4 mt-lg-0">
          <h5 className="mb-3 text-center">Selecciona actividades en el mapa</h5>
          <div className="ratio ratio-4x3 rounded overflow-hidden shadow">
            <iframe
              title="Mapa de actividades"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.016297195395!2d-122.41941568468146!3d37.77492977975905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c24b5c9c3%3A0x4d8e50c07d5d9b0a!2sSan%20Francisco%2C%20California!5e0!3m2!1ses!2ses!4v1661334499865!5m2!1ses!2ses"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

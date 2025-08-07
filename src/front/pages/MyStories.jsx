import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

export const MyStories = () => {
  const { trip_id } = useParams();

  // Datos de ejemplo: fotos y videos con info básica
  const [mediaFiles] = useState([
    {
      id: 1,
      url: "https://images.pexels.com/photos/20053299/pexels-photo-20053299.jpeg",
      type: "image",
      activity: "Paseo en el Retiro",
      date: "2025-08-08",
    },
    {
      id: 2,
      url: "https://images.pexels.com/photos/17164125/pexels-photo-17164125.jpeg",
      type: "image",
      activity: "Cena en restaurante",
      date: "2025-08-09",
    },
    {
      id: 3,
      url: "https://images.pexels.com/photos/31269492/pexels-photo-31269492.jpeg",
      type: "image",
      activity: "Visita museo",
      date: "2025-08-10",
    },
    
  ]);

  return (
    <div className="container py-5">
      {/* Título */}
      <div className="text-center mb-4">
        <h2 className="mb-1">
          <i className="fas fa-photo-video me-2 text-warning"></i>
          Media del viaje
        </h2>
        <small className="text-muted d-block mb-3">Trip ID: {trip_id || "—"}</small>
      </div>

      {/* Feed estilo Instagram */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
        {mediaFiles.length === 0 && (
          <p className="text-center text-muted">No hay fotos ni videos aún.</p>
        )}
        {mediaFiles.map((media) => (
          <div key={media.id} className="col">
            <div className="card shadow-sm">
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={`Actividad: ${media.activity}`}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: 200, width: "100%" }}
                />
              ) : (
                <video
                  controls
                  src={media.url}
                  className="card-img-top"
                  style={{ height: 200, width: "100%", objectFit: "cover" }}
                />
              )}
              <div className="card-body p-2 d-flex flex-column">
                <small className="text-muted">Actividad: {media.activity}</small>
                <small className="text-muted">Fecha: {media.date}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón volver */}
      <div className="text-center mt-4">
        <Link to={`/trips/${trip_id || ""}`} className="btn btn-login px-4">
          <i className="fas fa-arrow-left me-2"></i>
          Volver al viaje
        </Link>
      </div>
    </div>
  );
};

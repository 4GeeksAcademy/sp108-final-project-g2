import React from "react";
import { useNavigate } from "react-router-dom";

export const Trips = () => {
  const navigate = useNavigate();

  // Simulación: primer viaje es del usuario, otros dos como invitado
  const tripsAsOwner = [
    {
      id: 1,
      name: "Viaje a París",
      destination: "París, Francia",
      createdAt: "2025-06-15",
      isPublic: false,
      image:
        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&h=200",
    },
  ];

  const tripsAsGuest = [
    {
      id: 2,
      name: "Aventura en Perú",
      destination: "Cusco",
      createdAt: "2025-05-10",
      isPublic: true,
      image:
        "https://images.pexels.com/photos/1619311/pexels-photo-1619311.jpeg?auto=compress&cs=tinysrgb&h=200",
    },
    {
      id: 3,
      name: "Relajación en la playa",
      destination: "Playa tropical",
      createdAt: "2025-04-20",
      isPublic: true,
      image:
        "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&h=200",
    },
  ];

  return (
    <div className="container py-5">
      {/* Título principal */}
      <h2 className="text-dark mb-4 text-center">
        <i className="fas fa-suitcase-rolling fa-2x text-warning me-2"></i> Tus viajes
      </h2>

      <div className="row">
        {/* Columna: Viajes como Trip Owner */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h4 className="mb-0">Mis viajes</h4>
            <button
              className="btn btn-login px-4"
              onClick={() => navigate("/create-trip")}
            >
              <i className="fas fa-plus-circle me-2"></i> Crear viaje
            </button>
          </div>

          {tripsAsOwner.map((trip) => (
            <div className="card shadow-sm mb-3" key={trip.id}>
              <img
                src={trip.image}
                alt={`Foto del viaje ${trip.name}`}
                className="card-img-top"
                style={{ objectFit: "cover", height: "200px" }}
              />
              <div className="card-body">
                <h5 className="card-title">{trip.name}</h5>
                <p className="card-text text-muted mb-1">Destino: {trip.destination}</p>
                <p className="card-text small">
                  Creado el: {new Date(trip.createdAt).toLocaleDateString()}
                </p>
                <span
                  className={`badge ${trip.isPublic ? "bg-success" : "bg-secondary"}`}
                >
                  {trip.isPublic ? "Público" : "Privado"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Columna: Viajes como Invitado */}
        <div className="col-md-6">
          <h4 className="mb-3">Viajes como invitado</h4>
          {tripsAsGuest.map((trip) => (
            <div className="card shadow-sm mb-3" key={trip.id}>
              <img
                src={trip.image}
                alt={`Foto del viaje ${trip.name}`}
                className="card-img-top"
                style={{ objectFit: "cover", height: "200px" }}
              />
              <div className="card-body">
                <h5 className="card-title">{trip.name}</h5>
                <p className="card-text text-muted mb-1">Destino: {trip.destination}</p>
                <p className="card-text small">
                  Creado el: {new Date(trip.createdAt).toLocaleDateString()}
                </p>
                <span
                  className={`badge ${trip.isPublic ? "bg-success" : "bg-secondary"}`}
                >
                  {trip.isPublic ? "Público" : "Privado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

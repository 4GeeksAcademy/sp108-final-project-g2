import React, { useState } from "react";
import { useParams } from "react-router-dom";

export const TripDetails = () => {
  const { trip_id } = useParams(); // ID del viaje desde la URL

  // Estado para actividades relacionadas al viaje
  const [activities, setActivities] = useState([]);

  // Estado para la nueva actividad que vas a crear
  const [newActivityName, setNewActivityName] = useState("");

  // Datos simulados de viajes (puedes traerlos de tu API)
  const tripsAsOwner = [
    { id: 1, name: "Viaje a París", destination: "París, Francia" },
    { id: 2, name: "Aventura en Perú", destination: "Cusco" },
  ];

  const tripsAsGuest = [
    { id: 3, name: "Escapada a Roma", destination: "Roma, Italia" },
    { id: 4, name: "Playa en Cancún", destination: "Cancún, México" },
  ];

  // Función que maneja agregar actividad
  const handleAddActivity = (e) => {
    e.preventDefault();

    if (!newActivityName.trim()) return;

    const newActivity = {
      id: Date.now(),
      name: newActivityName,
    };

    setActivities([...activities, newActivity]);
    setNewActivityName("");
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Detalles del viaje {trip_id}</h1>

      {/* Sección de columnas de viajes */}
      <div className="row mb-5">
        {/* Columna como propietario */}
        <div className="col-md-6">
          <h4 className="mb-3">Mis viajes como propietario</h4>
          {tripsAsOwner.length > 0 ? (
            <ul className="list-group">
              {tripsAsOwner.map((trip) => (
                <li key={trip.id} className="list-group-item">
                  <strong>{trip.name}</strong> — {trip.destination}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No tienes viajes como propietario.</p>
          )}
        </div>

        {/* Columna como invitado */}
        <div className="col-md-6">
          <h4 className="mb-3">Viajes en los que estoy invitado</h4>
          {tripsAsGuest.length > 0 ? (
            <ul className="list-group">
              {tripsAsGuest.map((trip) => (
                <li key={trip.id} className="list-group-item">
                  <strong>{trip.name}</strong> — {trip.destination}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No estás invitado a ningún viaje.</p>
          )}
        </div>
      </div>

      {/* Formulario para agregar actividad */}
      <form onSubmit={handleAddActivity} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            placeholder="Nombre de la actividad"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="form-control"
          />
          <button type="submit" className="btn btn-primary">
            Agregar actividad
          </button>
        </div>
      </form>

      {/* Mostrar lista de actividades */}
      <ul className="list-group">
        {activities.map((act) => (
          <li key={act.id} className="list-group-item">
            {act.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

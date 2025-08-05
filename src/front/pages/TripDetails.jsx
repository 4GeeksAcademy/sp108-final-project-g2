import React, { useState } from "react";
import { useParams } from "react-router-dom";

export const TripDetails = () => {
  const { trip_id } = useParams(); // ID del viaje desde la URL

  // Estado para actividades relacionadas al viaje
  const [activities, setActivities] = useState([]);

  // Estado para la nueva actividad que vas a crear
  const [newActivityName, setNewActivityName] = useState("");

  // Función que maneja agregar actividad
  const handleAddActivity = (e) => {
    e.preventDefault();

    if (!newActivityName.trim()) return;

    // Crear nueva actividad (aquí puedes agregar más campos)
    const newActivity = {
      id: Date.now(), // id temporal
      name: newActivityName,
    };

    // Agregar a la lista de actividades
    setActivities([...activities, newActivity]);

    // Limpiar input
    setNewActivityName("");
  };

  return (
    <div>
      <h1>Detalles del viaje {trip_id}</h1>

      {/* Formulario para agregar actividad */}
      <form onSubmit={handleAddActivity}>
        <input
          type="text"
          placeholder="Nombre de la actividad"
          value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
        />
        <button type="submit">Agregar actividad</button>
      </form>

      {/* Mostrar lista de actividades */}
      <ul>
        {activities.map((act) => (
          <li key={act.id}>{act.name}</li>
        ))}
      </ul>
    </div>
  );
};


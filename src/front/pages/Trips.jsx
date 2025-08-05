import React, { useState } from "react";
import { Map } from "../components/Map";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Clave API desde variables de entorno

export const Trips = () => {
  // Estado del formulario
  const [destination, setDestination] = useState("");
  const [tripName, setTripName] = useState("");

  // CAMBIO - estado para el "trip" creado (null si no se creó todavía)
  const [currentTrip, setCurrentTrip] = useState(null);

  // CAMBIO - estado global de actividades (las vinculamos al currentTrip cuando exista)
  const [activities, setActivities] = useState([]);

  // CAMBIO - manejar submit "Crear viaje"
  const handleCreateTrip = (event) => {
    event.preventDefault();

    // Validaciones sencillas
    if (!tripName.trim()) {
      alert("Escribe un nombre para el viaje.");
      return;
    }

    // Crear trip en memoria (id temporal con Date.now)
    const newTrip = {
      id: Date.now(),
      name: tripName.trim(),
      destination: destination.trim(),
      createdAt: new Date().toISOString(),
      activities: [], // se llenará cuando se vayan añadiendo
    };

    setCurrentTrip(newTrip);

    // vaciar lista de actividades anterior (opcional)
    setActivities([]);

    // Mensaje pequeño
    console.log("Trip creado:", newTrip);
  };

  // CAMBIO - función que recibe una nueva actividad desde Map.jsx
  // y la asocia al trip (si existe)
  const handleAddActivity = (activity) => {
    if (!currentTrip) {
      // Si no hay trip creado, avisamos al usuario
      alert("Crea primero el viaje (botón 'Crear viaje') para guardar actividades.");
      return;
    }

    // actividad debe ser: { id, name, lat, lng, createdAt }
    const newActivity = {
      ...activity,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    // actualizamos estado local de activities
    setActivities((prev) => [...prev, newActivity]);

    // y actualizamos el objeto currentTrip.activities para que refleje el vínculo
    setCurrentTrip((prev) => {
      if (!prev) return prev;
      return { ...prev, activities: [...(prev.activities || []), newActivity] };
    });
  };

  // eliminar actividad (desde la lista bajo el mapa)
  const handleRemoveActivity = (activityId) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    setCurrentTrip((prev) => {
      if (!prev) return prev;
      return { ...prev, activities: (prev.activities || []).filter((a) => a.id !== activityId) };
    });
  };

  return (
    <div className="container py-5">
      {/* Título */}
      <h2 className="mb-4 text-center">
        <i className="fas fa-route fa-2x text-warning me-2"></i>
        Planifica tu viaje
      </h2>

      <div className="row justify-content-center align-items-start">
        {/* Formulario principal */}
        <div className="col-lg-5 mb-4">
          <form onSubmit={handleCreateTrip}>
            {/* Nombre del viaje */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-suitcase-rolling"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del viaje"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
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
                placeholder="Destino (ej: Madrid)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
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

            {/* Botón Crear viaje */}
            <div className="text-center">
              <button className="btn btn-login px-4" type="submit">
                <i className="fas fa-plus-circle me-2"></i>
                Crear viaje
              </button>
            </div>
          </form>

          <div className="mt-3 small text-muted">
            Primero crea el viaje para comenzar a guardar actividades desde el mapa.
          </div>
        </div>

        {/* Mapa + lista de actividades */}
        <div className="col-lg-6">         
          {/* Contenedor del mapa */}
          <div className="rounded overflow-hidden shadow mb-2" style={{ height: "450px", position: "relative" }}>
            {/* Map recibe el setter para notificar nuevas actividades */}
            <Map
              apiKey={apiKey}
              destination={destination}
              activities={activities}
              onAddActivity={handleAddActivity} // CAMBIO - función que Map llamará al crear actividad
            />
          </div>

          {/* tarjeta fija debajo del mapa (no fija en viewport, sino justo debajo) */}
          {currentTrip ? (
            <div className="card p-3 shadow">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">{currentTrip.name}</h6>
                  <small className="text-muted">Destino: {currentTrip.destination || "—"}</small>
                </div>
                <div className="text-end">
                  <small className="text-muted">Actividades:</small>
                  <div><strong>{(currentTrip.activities || []).length}</strong></div>
                </div>
              </div>

              {/* Lista compacta de actividades */}
              <div className="mt-3">
                {activities.length === 0 ? (
                  <p className="text-muted mb-0">Aún no hay actividades. Haz clic en el mapa para añadir.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {activities.map((act) => (
                      <li key={act.id} className="list-group-item d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{act.name}</strong>
                          <div className="small text-muted">Lat: {act.lat.toFixed(5)}, Lng: {act.lng.toFixed(5)}</div>
                        </div>
                        <div>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveActivity(act.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-3 shadow">
              <p className="mb-0 text-muted">Crea el viaje para que las actividades se guarden aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


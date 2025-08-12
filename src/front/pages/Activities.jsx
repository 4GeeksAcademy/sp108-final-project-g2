import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Map } from "../components/Map.jsx"; // Ajusta si hace falta



export const Activities = () => {
  const token = localStorage.getItem("token");
  const { trip_id } = useParams();

    const [activityName, setActivityName] = useState("");
    const [activityDescription, setActivityDescription] = useState("");
    const [activityDate, setActivityDate] = useState("");
    const [activityTime, setActivityTime] = useState("");
    const [activityAddress, setActivityAdress] = useState("");

  const handleActivityName = event => setActivityName(event.target.value);
	const handleActivityDescription = event => setActivityDescription(event.target.value);
	const handleActivityDate = event => setActivityDate(event.target.value);
	const handleActivityTime = event => setActivityTime(event.target.value);
	const handleActivityAddress = event => setActivityAdress(event.target.value);

  const handleSubmitActivity = async (event) => {
  event.preventDefault();

   

  };

  const initialActivities = [
    {
      id: 1,
      name: "Paseo en el Retiro",
      description: "Paseo agradable en el parque Retiro",
      date: "2025-08-08",
      time: "10:00",
      address: "Parque del Retiro, Madrid, España",
      lat: 40.4154,
      lng: -3.6840,
      source: "manual",
      createdAt: new Date().toISOString(),
    },
  ];

  const [activities, setActivities] = useState(initialActivities);

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    address: "",
  });

  const [mapSelectionActive, setMapSelectionActive] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Por favor escribe un nombre para la actividad.");
      return;
    }
    const newActivity = {
      id: Date.now(),
      name: form.name.trim(),
      description: form.description.trim(),
      date: form.date || null,
      time: form.time || null,
      address: form.address.trim() || null,
      lat: null,
      lng: null,
      source: "manual",
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [...prev, newActivity]);
    setForm({ name: "", description: "", date: "", time: "", address: "" });
  };

  const handleAddActivityFromMap = (activity) => {
    const newActivity = {
      id: Date.now(),
      name: activity.name || "Actividad (desde mapa)",
      description: activity.description || "",
      date: activity.date || null,
      time: activity.time || null,
      address: activity.address || "",
      lat: activity.lat,
      lng: activity.lng,
      place_id: activity.place_id || null,
      source: "map",
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [...prev, newActivity]);
    setMapSelectionActive(false);
  };

  const handleDelete = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };
 // termina lo que ha trabajado giobani
  return (
    <div className="container py-5">
      {/* Título */}
      <div className="text-center mb-4">
        <h2 className="mb-1">
          <i className="fas fa-list-check me-2 text-warning"></i>
          Actividades del viaje
        </h2>
        <small className="text-muted d-block mb-3">Trip ID: {trip_id || "—"}</small>
      </div>

      <div className="row">
        {/* Formulario manual */}
        <div className="col-lg-5 mb-4">
          <form onSubmit={handleSubmitActivity}>
            <div className="mb-2 input-group">
              <span className="input-group-text"><i className="fas fa-tag"></i></span>
              <input
                name="name"
                value={activityName}
                onChange={handleActivityName}
                className="form-control"
                placeholder="Nombre de la actividad"
              />
            </div>

            <div className="mb-2 input-group">
              <span className="input-group-text"><i className="fas fa-align-left"></i></span>
              <input
                name="description"
                value={activityDescription}
                onChange={handleActivityDescription}
                className="form-control"
                placeholder="Descripción (opcional)"
              />
            </div>

            <div className="mb-2 d-flex gap-2">
              <div className="input-group flex-fill">
                <span className="input-group-text"><i className="fas fa-calendar-alt"></i></span>
                <input
                  name="date"
                  value={activityDate}
                  onChange={handleActivityDate}
                  type="date"
                  className="form-control"
                />
              </div>
              <div className="input-group" style={{ width: 200 }}>
                <span className="input-group-text"><i className="fas fa-clock"></i></span>
                <input
                  name="time"
                  value={activityTime}
                  onChange={handleActivityTime}
                  type="time"
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3 input-group">
              <span className="input-group-text"><i className="fas fa-map-marker-alt"></i></span>
              <input
                name="address"
                value={activityAddress}
                onChange={handleActivityAddress}
                className="form-control"
                placeholder="Dirección (opcional)"
              />
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn-login px-4">
                <i className="fas fa-plus-circle me-2"></i> Añadir actividad
              </button>

              <button
                type="button"
                className={`btn-login px-4 ${mapSelectionActive ? "btn-warning" : ""}`}
                onClick={() => setMapSelectionActive((v) => !v)}
              >
                <i className="fas fa-map-marker-alt me-2"></i>
                {mapSelectionActive ? "Modo selección activado" : "Activar selección mapa"}
              </button>
            </div>

            {mapSelectionActive && (
              <div className="alert alert-info mt-3">
                <strong>Modo selección activo:</strong> Haz clic en el mapa para añadir una actividad.
              </div>
            )}
          </form>
        </div>

        {/* Mapa siempre visible */}
        <div className="col-lg-7" style={{ height: 460 }}>
          <Map
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            destination={form.address || "Madrid"}
            activities={activities}
            onAddActivity={handleAddActivityFromMap}
            enableSelection={mapSelectionActive}
          />
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="row mt-4">
        <div className="col">
          <h5 className="mb-2">Actividades ({activities.length})</h5>
          {activities.length === 0 ? (
            <p className="text-muted">No hay actividades todavía.</p>
          ) : (
            <ul className="list-group">
              {activities.map((act) => (
                <li key={act.id} className="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{act.name}</strong>
                    <div className="small text-muted">
                      {act.address ? act.address + " · " : ""}
                      {act.date ? `${act.date}${act.time ? " " + act.time : ""}` : ""}
                      {act.source ? ` · fuente: ${act.source}` : ""}
                    </div>
                    {act.description && <div className="mt-1">{act.description}</div>}
                  </div>

                  <div className="d-flex flex-column align-items-end">
                    <small className="text-muted">{new Date(act.createdAt).toLocaleString()}</small>
                    <div className="mt-2">
                      <button className="btn btn-sm btn-outline-secondary me-2" title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(act.id)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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

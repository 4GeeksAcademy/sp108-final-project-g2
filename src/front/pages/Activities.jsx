import React, { useState } from "react";
import { Map } from "../components/Map.jsx";

const initialDays = [
  { id: 1, label: "Día 1", date: "2025-08-08" },
  { id: 2, label: "Día 2", date: "2025-08-09" },
  { id: 3, label: "Día 3", date: "2025-08-10" },
];

export const Activities = () => {
  const [days] = useState(initialDays);
  const [selectedDayId, setSelectedDayId] = useState(days[0].id);

  // actividades por día
  const [activitiesByDay, setActivitiesByDay] = useState({
    1: [],
    2: [],
    3: [],
  });

  // formulario para actividades manuales
  const [form, setForm] = useState({ name: "", time: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Agregar actividad manual o de mapa (cuando onAddActivity es llamada)
  const handleAddActivity = (activity) => {
    setActivitiesByDay((prev) => ({
      ...prev,
      [selectedDayId]: [...(prev[selectedDayId] || []), activity],
    }));
    setForm({ name: "", time: "", description: "" });
    setEditingId(null);
  };

  // Borrar actividad
  const handleDeleteActivity = (id) => {
    setActivitiesByDay((prev) => ({
      ...prev,
      [selectedDayId]: prev[selectedDayId].filter((a) => a.id !== id),
    }));
  };

  // Toggle completar actividad
  const handleToggleCompleted = (id) => {
    setActivitiesByDay((prev) => ({
      ...prev,
      [selectedDayId]: prev[selectedDayId].map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      ),
    }));
  };

  // Editar actividad
  const handleStartEdit = (activity) => {
    setEditingId(activity.id);
    setForm({
      name: activity.name,
      time: activity.time || "",
      description: activity.description || "",
    });
  };

  // Guardar edición
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Escribe un nombre para la actividad");
      return;
    }
    setActivitiesByDay((prev) => ({
      ...prev,
      [selectedDayId]: prev[selectedDayId].map((a) =>
        a.id === editingId
          ? { ...a, name: form.name.trim(), time: form.time, description: form.description }
          : a
      ),
    }));
    setEditingId(null);
    setForm({ name: "", time: "", description: "" });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", time: "", description: "" });
  };

  const activities = activitiesByDay[selectedDayId] || [];

  return (
    <div className="container py-4">
      {/* Selector de días */}
      <div className="mb-4 d-flex gap-2 justify-content-center">
        {days.map((day) => (
          <button
            key={day.id}
            className={`btn btn-outline-primary ${day.id === selectedDayId ? "active" : ""}`}
            onClick={() => {
              setSelectedDayId(day.id);
              setEditingId(null);
              setForm({ name: "", time: "", description: "" });
            }}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Mapa */}
      <div className="mb-4" style={{ height: 400 }}>
        <Map
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          destination="Madrid"
          activities={activities}
          onAddActivity={handleAddActivity}
        />
      </div>

      {/* Lista actividades */}
      <h4>Actividades para {days.find((d) => d.id === selectedDayId)?.label}</h4>
      {activities.length === 0 ? (
        <p className="text-muted">No hay actividades para este día.</p>
      ) : (
        <ul className="list-group mb-4">
          {activities.map((act) => (
            <li
              key={act.id}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                act.completed ? "list-group-item-success" : ""
              }`}
            >
              <div className="d-flex align-items-center gap-3">
                <input
                  type="checkbox"
                  checked={act.completed}
                  onChange={() => handleToggleCompleted(act.id)}
                />
                <div>
                  <strong>{act.name}</strong>{" "}
                  {act.time && <small className="text-muted">({act.time})</small>}
                  {act.description && <div>{act.description}</div>}
                  {act.source === "map" && act.placeInfo && (
                    <small className="text-info d-block">
                      <a href={act.placeInfo.url} target="_blank" rel="noreferrer">
                        Ver en Google Maps
                      </a>
                    </small>
                  )}
                </div>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => handleStartEdit(act)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteActivity(act.id)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario añadir o editar actividad manual */}
      <div className="card p-3">
        <h5>{editingId ? "Editar actividad" : "Añadir actividad manual"}</h5>
        <form onSubmit={editingId ? handleSaveEdit : (e) => {
          e.preventDefault();
          if (!form.name.trim()) {
            alert("Escribe un nombre para la actividad");
            return;
          }
          handleAddActivity({
            id: Date.now(),
            name: form.name.trim(),
            time: form.time || null,
            description: form.description.trim() || "",
            completed: false,
            source: "manual",
            placeInfo: null,
          });
          setForm({ name: "", time: "", description: "" });
        }}>
          <div className="mb-2">
            <label htmlFor="name" className="form-label">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="mb-2">
            <label htmlFor="time" className="form-label">
              Hora
            </label>
            <input
              id="time"
              name="time"
              type="time"
              className="form-control"
              value={form.time}
              onChange={handleFormChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows={3}
              value={form.description}
              onChange={handleFormChange}
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-login">
              {editingId ? "Guardar cambios" : "Añadir actividad"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

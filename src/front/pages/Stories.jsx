import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

const MyStories = () => {
  const { trip_id } = useParams();

  // Simulación: lista de actividades asociadas al viaje
  const [activities] = useState([
    { id: 1, name: "Paseo en el Retiro" },
    { id: 2, name: "Cena en restaurante" },
    { id: 3, name: "Visita museo" },
  ]);

  // Estado para los medios subidos
  const [mediaFiles, setMediaFiles] = useState([]);

  // Formulario upload
  const [form, setForm] = useState({
    file: null,
    activityId: "",
    date: "",
  });

  // Maneja cambios en formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Subir archivo
  const handleUpload = (e) => {
    e.preventDefault();
    if (!form.file) {
      alert("Selecciona un archivo");
      return;
    }
    if (!form.activityId) {
      alert("Selecciona la actividad");
      return;
    }
    const newMedia = {
      id: Date.now(),
      url: URL.createObjectURL(form.file),
      type: form.file.type.startsWith("video") ? "video" : "image",
      activityId: Number(form.activityId),
      date: form.date || null,
      createdAt: new Date().toISOString(),
    };
    setMediaFiles((prev) => [newMedia, ...prev]);
    setForm({ file: null, activityId: "", date: "" });
  };

  // Eliminar medio
  const handleDelete = (id) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  };

  // Edición (solo UI, sin funcionalidad)
  const handleEdit = (id) => {
    alert("Funcionalidad editar pendiente de implementar");
  };

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

      {/* Formulario de subida */}
      <form onSubmit={handleUpload} className="mb-4">
        <div className="row g-2 align-items-center justify-content-center">
          <div className="col-auto">
            <input
              type="file"
              name="file"
              accept="image/*,video/*"
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-auto">
            <select
              name="activityId"
              value={form.activityId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Selecciona actividad</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-auto">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-login px-4">
              Subir
            </button>
          </div>
        </div>
      </form>

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
                  alt="Media subida"
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
                <small className="text-muted">
                  Actividad:{" "}
                  {activities.find((a) => a.id === media.activityId)?.name || "—"}
                </small>
                <small className="text-muted">
                  Fecha: {media.date || "No especificada"}
                </small>

                <div className="mt-auto d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleEdit(media.id)}
                    title="Editar"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(media.id)}
                    title="Eliminar"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
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



import React, { useState } from "react";

export const Trips = () => {
  // Estado para el nombre del viaje
  const [tripName, setTripName] = useState("");

  // Estado para el destino del viaje
  const [destination, setDestination] = useState("");

  // Estado booleano para saber si el viaje es público (true) o privado (false)
  const [isPublic, setIsPublic] = useState(false);

  // Estado para mostrar u ocultar el campo de invitación de amigos
  const [showInviteInput, setShowInviteInput] = useState(false);

  // Estado para almacenar los emails de los amigos invitados (separados por coma)
  const [invitedFriends, setInvitedFriends] = useState("");

  // Estado para la fecha de inicio del viaje
  const [startDate, setStartDate] = useState("");

  // Estado para la fecha de fin del viaje
  const [endDate, setEndDate] = useState("");

  // Estado para la descripción del viaje
  const [description, setDescription] = useState("");

  // Estado que guarda el viaje creado actualmente (objeto con todos los datos)
  const [currentTrip, setCurrentTrip] = useState(null);

  // Simulación de viajes anteriores del usuario para mostrar en la interfaz
  const previousTrips = [
    {
      id: 1,
      name: "Viaje a París",
      destination: "París, Francia",
      createdAt: "2025-06-15",
      isPublic: false,
      image:
        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&h=200",
    },
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

  // Función para manejar la creación de un nuevo viaje cuando se envía el formulario
  const handleCreateTrip = (event) => {
    event.preventDefault();

    // Validar que el nombre del viaje no esté vacío
    if (!tripName.trim()) {
      alert("Por favor, escribe un nombre para el viaje.");
      return;
    }

    // Crear el objeto viaje con toda la información recogida
    const newTrip = {
      id: Date.now(), // ID temporal basado en timestamp
      name: tripName.trim(),
      destination: destination.trim(),
      isPublic, // Booleano que indica si es público o privado
      invitedFriends: invitedFriends
        .split(",") // Separar los emails por coma
        .map((email) => email.trim()) // Quitar espacios en cada email
        .filter((email) => email.length > 0), // Eliminar strings vacíos
      startDate,
      endDate,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    // Guardar el viaje creado en el estado
    setCurrentTrip(newTrip);

    // Limpiar campos de invitados y ocultar input
    setInvitedFriends("");
    setShowInviteInput(false);

    console.log("✅ Viaje creado:", newTrip);
  };

  // Función para alternar el estado público/privado del viaje (checkbox)
  const handleIsPublicChange = () => {
    setIsPublic((prev) => !prev);
  };

  // Función para mostrar u ocultar el campo de invitación de amigos
  const toggleInviteInput = () => {
    setShowInviteInput((prev) => !prev);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">
        <i className="fas fa-route fa-2x text-warning me-2"></i>
        Planifica tu viaje
      </h2>

      <div className="row justify-content-center align-items-start">
        <div className="col-lg-6 mb-4">
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
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Fecha fin */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-calendar-check"></i>
              </span>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Botón para mostrar/ocultar input para invitar amigos */}
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-login px-4"
                onClick={toggleInviteInput}
              >
                <i className="fas fa-user-plus me-2"></i> Invitar amigos
              </button>
            </div>

            {/* Input para emails invitados (solo visible si showInviteInput es true) */}
            {showInviteInput && (
              <div className="mb-3 input-group">
                <span className="input-group-text">
                  <i className="fas fa-user-friends"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Emails separados por coma"
                  value={invitedFriends}
                  onChange={(e) => setInvitedFriends(e.target.value)}
                />
              </div>
            )}

            {/* Checkbox para viaje público */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="publicCheckbox"
                checked={isPublic}
                onChange={handleIsPublicChange}
              />
              <label className="form-check-label" htmlFor="publicCheckbox">
                Hacer viaje público
              </label>
            </div>

            {/* Botón para crear viaje */}
            <div className="text-center">
              <button className="btn btn-login px-4" type="submit">
                <i className="fas fa-plus-circle me-2"></i>
                Crear viaje
              </button>
            </div>
          </form>

          {/* Mostrar detalles del viaje creado */}
          {currentTrip && (
            <div className="card mt-4 p-3 shadow">
              <h5 className="mb-2">{currentTrip.name}</h5>
              <p className="mb-1 text-muted">Destino: {currentTrip.destination}</p>
              <p className="mb-1">
                {currentTrip.isPublic ? "🌍 Público" : "🔒 Privado"}
              </p>
              {currentTrip.invitedFriends.length > 0 && (
                <p className="mb-0 small text-muted">
                  Invitados: {currentTrip.invitedFriends.join(", ")}
                </p>
              )}
              <p className="mt-2 mb-0 small">
                Fechas: {currentTrip.startDate || "—"} → {currentTrip.endDate || "—"}
              </p>
              {currentTrip.description && <p className="mt-2">{currentTrip.description}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Mostrar viajes anteriores */}
      <div className="mt-5">
        <h4 className="mb-3">Mis viajes anteriores</h4>
        <div className="row">
          {previousTrips.map((trip) => (
            <div className="col-md-6 col-lg-4 mb-3" key={trip.id}>
              <div className="card shadow-sm">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

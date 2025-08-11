import React, { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { postTrip } from "../services/hello-world-services.js"


export const CreateTrip = () => {

  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  // Estado para el nombre del viaje
  const [tripName, setTripName] = useState("");
  // Estado para la fecha de inicio del viaje
  const [tripStartDate, setTripStartDate] = useState("");
  // Estado para la fecha de fin del viaje
  const [tripEndDate, setTripEndDate] = useState("");
  // Estado booleano para saber si el viaje es público (true) o privado (false)
  const [tripPublicated, setTripPublicated] = useState(false);

  /* Estado para el destino del viaje
  const [tripDestination, setTripDestination] = useState("");
  Estado para la descripción del viaje
  const [description, setDescription] = useState(""); */
  
  /* Estado para mostrar u ocultar el campo de invitación de amigos
  const [showInviteInput, setShowInviteInput] = useState(false);
  Estado para almacenar los emails de los amigos invitados (separados por coma)
  const [invitedFriends, setInvitedFriends] = useState(""); */

  const handleTripName = event => setTripName(event.target.value);
  const handleTripStartDate = event => setTripStartDate(event.target.value);
  const handleTripEndDate = event => setTripEndDate(event.target.value);
  const handleTripPublicated = event => setTripPublicated(event.target.checked);
  /* const handleTripDestination = event => setTripDestination(event.target.value); */

  const handleSubmitTrip = async (event) => {
    event.preventDefault();
    const tripToPost = {
      "title": tripName,
      "start_date": tripStartDate,
      "end_date": tripEndDate,
      "publicated": tripPublicated,
    }
    const tripPosted = await postTrip(tripToPost);
    if (tripPosted) {
      dispatch({
        type: "POST-TRIP",
        payload: tripPosted
      });
      navigate("/trips");
    } else {
      return alert("Credenciales inválidas")
    }
  };

  const handleCancel = () => {
    navigate("/trips");
  };

  /* Función para mostrar u ocultar el campo de invitación de amigos
  const toggleInviteInput = () => {
    setShowInviteInput((prev) => !prev);
  }; */

  /* invitedFriends: invitedFriends
    .split(",") // Separar los emails por coma
    .map((email) => email.trim()) // Quitar espacios en cada email
    .filter((email) => email.length > 0), // Eliminar strings vacíos */

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">
        <i className="fas fa-route fa-2x text-warning me-2"></i>
        Planifica tu viaje
      </h2>
      <div className="row justify-content-center align-items-start">
        <div className="col-lg-6 mb-4">
          <form onSubmit={handleSubmitTrip}>

            {/* Nombre del viaje */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-suitcase-rolling"></i>
              </span>
              <input type="text" className="form-control" placeholder="Nombre del viaje"
                value={tripName} onChange={handleTripName} />
            </div>

            {/* Fecha inicio */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-calendar-alt"></i>
              </span>
              <input type="date" className="form-control"
                value={tripStartDate} onChange={handleTripStartDate} />
            </div>

            {/* Fecha fin */}
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-calendar-check"></i>
              </span>
              <input type="date" className="form-control"
                value={tripEndDate} onChange={handleTripEndDate} />
            </div>

            {/* Destino
            <div className="mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-map-marker-alt"></i>
              </span>
              <input type="text" className="form-control" placeholder="Destino"
                value={tripDestination} onChange={handleTripDestination} />
            </div> */}

            {/* Descripción 
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
            </div> */}

            {/* Botón para mostrar/ocultar input para invitar amigos
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-login px-4"
                onClick={toggleInviteInput}
              >
                <i className="fas fa-user-plus me-2"></i> Invitar amigos
              </button>
            </div> */}

            {/* Input para emails invitados (solo visible si showInviteInput es true)
            showInviteInput && (
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
            ) */}

            {/* Checkbox para viaje público */}
            <div className="mb-3 form-check">
              <input className="form-check-input" type="checkbox" id="publicated"
                checked={tripPublicated} onChange={handleTripPublicated} />
              <label className="form-check-label" htmlFor="publicated">
                Hacer viaje público
              </label>
            </div>

            {/* Botón para crear o cancelar el viaje */}
            <div className="text-center">
              <button className="btn btn-login px-4" type="submit">
                <i className="fas fa-plus-circle me-2"></i>
                Crear viaje
              </button>
              <button onClick={handleCancel} type="button" className="btn bg-secondary text-white">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
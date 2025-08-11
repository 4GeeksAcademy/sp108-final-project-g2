import React, { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { putTrip, deleteTrip } from "../services/hello-world-services.js"

export const TripDetails = () => {
  const { trip_id } = useParams();
  const tripId = parseInt(trip_id)
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const trip = store.trips.tripsOwner.find(trip => trip.id === tripId);

  const [tripName, setTripName] = useState(trip.title || "");
  const [tripStartDate, setTripStartDate] = useState(trip.start_date || "");
  const [tripEndDate, setTripEndDate] = useState(trip.end_date || "");
  const [tripPublicated, setTripPublicated] = useState(trip.publicated || false);

  const handleTripName = event => setTripName(event.target.value);
  const handleTripStartDate = event => setTripStartDate(event.target.value);
  const handleTripEndDate = event => setTripEndDate(event.target.value);
  const handleTripPublicated = event => setTripPublicated(event.target.checked);

  const handleSubmitEditedTrip = async (event) => {
    event.preventDefault();
    const tripToPut = {
      "title": tripName,
      "start_date": tripStartDate,
      "end_date": tripEndDate,
      "publicated": tripPublicated,
    }
    const tripPut = await putTrip(tripId, tripToPut);
    if (tripPut) {
      dispatch({
        type: "PUT-TRIP",
        payload: tripPut
      });
      navigate(`/trips`);
    } else {
      return alert("Credenciales inválidas");
    }
  };

  const handleCancel = () => {
    navigate(`/trips/${tripId}/activities`);
  };

  const handleDeleteTrip = async () => {
    if (trip) {
      const tripDeleted = await deleteTrip(trip);
      dispatch({
        type: "DELETE-TRIP",
        payload: tripDeleted
      });
      navigate(`/trips`);
    } else {
      return alert("Credenciales inválidas");
    }
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">
        <i class="fa-solid fa-gear text-warning me-2"></i>
        Ajustes del viaje
      </h2>
      <div className="row justify-content-center align-items-start">
        <div className="col-lg-6 mb-4">
          <form onSubmit={handleSubmitEditedTrip}>

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

            {/* Checkbox para viaje público */}
            <div className="mb-3 form-check">
              <input className="form-check-input" type="checkbox" id="publicated"
                checked={tripPublicated} onChange={handleTripPublicated} />
              <label className="form-check-label" htmlFor="publicated">
                Hacer viaje público
              </label>
            </div>

            {/* Botón para crear, cancelar el viaje o eliminar el viaje */}
            <div className="text-center">
              <button className="btn btn-login px-4" type="submit">
                <i className="fas fa-plus-circle me-2"></i>
                Editar viaje
              </button>
              <button onClick={handleCancel} type="button" className="btn bg-secondary text-white">
                Cancelar
              </button>
            </div>
          </form>
          <button onClick={handleDeleteTrip} type="button" className="btn bg-danger text-white">
            Eliminar viaje
          </button>
        </div>
      </div>
    </div>
  );
};




/* const handleAddActivity = (e) => {
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
  }; */


/* return (
    <div>
      <h1>Detalles del viaje {trip_id}</h1>

      Formulario para agregar actividad 
      <form onSubmit={handleAddActivity}>
        <input
          type="text"
          placeholder="Nombre de la actividad"
          value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
        />
        <button type="submit">Agregar actividad</button>
      </form>

      Mostrar lista de actividades 
      <ul>
        {activities.map((act) => (
          <li key={act.id}>{act.name}</li>
        ))}
      </ul>
    </div>
  ); */

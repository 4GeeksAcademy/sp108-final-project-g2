import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { getActivities, postActivity } from "../services/hello-world-services.js"

import { Map } from "../components/Map.jsx"; // Ajusta si hace falta


export const Activities = () => {

  const { trip_id } = useParams();
  const tripId = parseInt(trip_id)
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const userId = store.currentUser.id
  const trip = store.trips.tripsOwner?.find(trip => trip.id === tripId) || store.trips.userTrips?.find(trip => trip.id === tripId);
  const userIsOwner = trip && trip.trip_owner_id === userId;
  console.log(trip)

  const activities = store.activities?.find(activities => activities?.trip_to?.trip_id === tripId) || [];
  console.log(activities)


  useEffect(() => {
    const getAllActivities = async () => {
      const allActivities = await getActivities();
      console.log(allActivities);
      dispatch({
        type: "GET-ACTIVITIES",
        payload: allActivities
      });
    };
    getAllActivities();
  }, [])

  const [activityTitle, setActivityTitle] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityAddress, setActivityAdress] = useState("");
  const [activityNotes, setActivityNotes] = useState("");

  const handleActivityTitle = event => setActivityTitle(event.target.value);
  const handleActivityDate = event => setActivityDate(event.target.value);
  const handleActivityTime = event => setActivityTime(event.target.value);
  const handleActivityAddress = event => setActivityAdress(event.target.value);
  const handleActivityNotes = event => setActivityNotes(event.target.value);


  const handleSubmitActivity = async (event) => {
    event.preventDefault();
    const activityToPost = {
      "title": activityTitle,
      "date": activityDate,
      "time": activityTime,
      "address": activityAddress,
      "notes": activityNotes
    }
    const activityPosted = await postActivity(tripId, activityToPost);
    if (activityPosted) {
      const activities = getActivities();
      dispatch({
        type: "GET-ACTIVITIES",
        payload: activities
      });
    } else {
      return alert("Credenciales inválidas")
    }
  };

  const handleActivityDetails = (activity) => {
    navigate(`/trips/${tripId}/activities/${activity.id}/stories`);
  }

  const handleEditActivity = (event, activity) => {
    event.stopPropagation();
    navigate(`/trips/${tripId}/activities/${activity.id}`);
  }

  const handleReturnToTrips = () => {
    navigate(`/trips/${tripId}/activities`);
  }

  /* const [mapSelectionActive, setMapSelectionActive] = useState(false);

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
  }; */
  return (
    <div className="container py-5">
      {/* Título */}
      {activities.length > 0 && (<div className="text-center mb-4">
        <h2 className="mb-1">
          <i className="fas fa-list-check me-2 text-warning"></i>
          Actividades del viaje {activities.trip_to.title}
        </h2>
        <small className="text-muted d-block mb-3">De {activities.trip_to.start_date} a {activities.trip_to.end_date}</small>
      </div>)}

      {/* Formulario Post Activity */}
      {userIsOwner ?
        <div className="row">

          <div className="col-lg-5 mb-4">
            <form onSubmit={handleSubmitActivity}>
              <div className="mb-2 input-group">
                <span className="input-group-text"><i className="fas fa-tag"></i></span>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={handleActivityTitle}
                  className="form-control"
                  placeholder="Nombre de la actividad"
                />
              </div>

              <div className="mb-2 input-group">
                <span className="input-group-text"><i className="fas fa-align-left"></i></span>
                <input
                  type="text"
                  value={activityNotes}
                  onChange={handleActivityNotes}
                  className="form-control"
                  placeholder="Descripción (opcional)"
                />
              </div>

              <div className="mb-2 d-flex gap-2">
                <div className="input-group flex-fill">
                  <span className="input-group-text"><i className="fas fa-calendar-alt"></i></span>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={handleActivityDate}
                    className="form-control"
                  />
                </div>
                <div className="input-group" style={{ width: 150 }}>
                  <span className="input-group-text"><i className="fas fa-clock"></i></span>
                  <input
                    type="time"
                    value={activityTime}
                    onChange={handleActivityTime}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="mb-3 input-group">
                <span className="input-group-text"><i className="fas fa-map-marker-alt"></i></span>
                <input
                  type="text"
                  value={activityAddress}
                  onChange={handleActivityAddress}
                  className="form-control"
                  placeholder="Dirección (opcional)"
                />
              </div>
              {/*<div className="d-grid gap-2">
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
            )}*/}
            </form>
          </div>
          {/* Mapa siempre visible */}
          {/* <div className="col-lg-7" style={{ height: 460 }}>
            <Map
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              destination={form.address || "Madrid"}
              activities={activities}
              onAddActivity={handleAddActivityFromMap}
              enableSelection={mapSelectionActive}
            />
          </div> */}
        </div>
        :
        <div className="d-none"></div>
      }

      {/* Lista de actividades */}
      <div className="row mt-4">
        <div className="col">
          <h5 className="mb-2">Actividades ({activities.length})</h5>
          {activities.length > 0 ?
            <ul className="list-group">
              {activities.map((activity) => (
                <li key={activity.id} onClick={() => handleActivityDetails(activity)}
                  className="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{activity.title}</strong>
                    <div className="small text-muted">
                      {activity.address}
                      {activity.date + " " + activity.time}
                    </div>
                    <div className="mt-1">
                      {activity.notes}
                    </div>
                    {userIsOwner ?
                      <div className="mt-2">
                        <button onClick={(event) => handleEditActivity(event, activity)} type="button" className="btn btn-sm btn-outline-secondary me-2">
                          <i className="fas fa-edit"></i>
                          Editar actividad
                        </button>
                      </div>
                      :
                      <div className="d-none"></div>
                    }
                  </div>
                </li>
              ))}
            </ul>
            :
            <ul className="list-group">
              <li className="list-group-item d-flex justify-content-between align-items-start text-muted">
                No hay actividades todavía
              </li>
            </ul>
          }
        </div>
        {/* Botón volver */}
        <div className="text-center mt-4">
          <button onClick={handleReturnToTrips} className="btn btn-login px-4">
            <i className="fas fa-arrow-left me-2"></i>
            Volver al viaje
          </button>
        </div>
      </div>
    </div>
  );
};

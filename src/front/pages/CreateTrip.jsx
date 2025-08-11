import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { postTrips } from "../services/hello-world-services.js";

export const CreateTrip = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  // Estados del formulario
  const [tripName, setTripName] = useState("");
  const [tripStartDate, setTripStartDate] = useState("");
  const [tripEndDate, setTripEndDate] = useState("");
  const [tripPublicated, setTripPublicated] = useState(false);
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState("");

  // Handlers para inputs
  const handleTripName = (e) => setTripName(e.target.value);
  const handleTripStartDate = (e) => setTripStartDate(e.target.value);
  const handleTripEndDate = (e) => setTripEndDate(e.target.value);
  const handleTripPublicated = (e) => setTripPublicated(e.target.checked);

  const handleSubmitTrip = async (e) => {
    e.preventDefault();
    const tripToPost = {
      title: tripName,
      start_date: tripStartDate,
      end_date: tripEndDate,
      publicated: tripPublicated,
    };
    const tripPosted = await postTrips(tripToPost);
    if (tripPosted) {
      dispatch({
        type: "POST-TRIPS",
        payload: tripPosted.results,
      });
      // Reset form
      setTripName("");
      setTripStartDate("");
      setTripEndDate("");
      setTripPublicated(false);
      // Navegar a Mis Viajes
      navigate("/trips");
    } else {
      alert("No se pudo crear el viaje");
    }
  };

  const handleCancel = () => {
    // Resetea formulario y navega a Home
    setTripName("");
    setTripStartDate("");
    setTripEndDate("");
    setTripPublicated(false);
    navigate("/");
  };

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
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del viaje"
                value={tripName}
                onChange={handleTripName}
                required
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
                value={tripStartDate}
                onChange={handleTripStartDate}
                required
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
                value={tripEndDate}
                onChange={handleTripEndDate}
                required
              />
            </div>

            {/* Checkbox + botones alineados */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
              {/* Checkbox */}
              <div className="form-check mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="publicated"
                  checked={tripPublicated}
                  onChange={handleTripPublicated}
                />
                <label className="form-check-label ms-2 mb-0" htmlFor="publicated">
                  Hacer viaje público
                </label>
              </div>

              {/* Botones juntos */}
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-login btn-sm-custom px-3" type="submit">
                  <i className="fas fa-plus-circle me-2"></i>
                  Crear viaje
                </button>

                <button
                  onClick={handleCancel}
                  type="button"
                  className="btn btn-login btn-sm-custom px-3"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { getTrips } from "../services/hello-world-services.js"


export const Trips = () => {

  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const tripsOwner = store.trips.tripsOwner;
  const userTrips = store.trips.userTrips;

  
  useEffect(() => {
    const getAllTrips = async () => {
      const allTrips = await getTrips();
      dispatch({
        type: "GET-TRIPS",
        payload: allTrips
      });
    };
    getAllTrips();
  }, [])


  const handleImageError = (imageError) => {
    imageError.target.src = "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&h=200";
  }

  const handleTripOwnerDetails = (tripOwner) => {
    navigate(`/trips/${tripOwner.id}/activities`);
  }

  const handleEditTrip = (event, tripOwner) => {
    event.stopPropagation();
    navigate(`/trips/${tripOwner.id}`);
  }

  const handleUserTripsDetails = (userTrip) => {
    navigate(`/trips/${userTrip.trip_to.id}/activities`);
  }


  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">
        <i className="fas fa-route fa-2x text-warning me-2"></i>
        Mis viajes
      </h2>
      <div className="row justify-content-center align-items-start">
        <div className="col-lg-6 mb-4">

          {/* Mostrar viajes de los que soy dueño */}
          <div className="mt-5">
            <h4 className="mb-3">Propietario</h4>
            <div className="row">
              {(tripsOwner || []).map((tripOwner) => {
                return (
                  <div className="col-md-6 col-lg-4 mb-3" key={tripOwner.id}>
                    <div className="card shadow-sm" onClick={() => handleTripOwnerDetails(tripOwner)}>
                      {/* En el apartado src se podría traer una imagen del apartado stories, si no ya carga una imagen por defecto */}
                      <img
                        src=""
                        onError={handleImageError}
                        alt={`Foto del viaje ${tripOwner.title}`}
                        className="card-img-top"
                        style={{ objectFit: "cover", height: "200px" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{tripOwner.title}</h5>
                        <p className="card-text small">{tripOwner.startDate}</p>
                        <p className="card-text small">{tripOwner.endDate}</p>
                        <span className={`badge ${tripOwner.isPublic ? "bg-success" : "bg-secondary"}`}>
                          {tripOwner.isPublic ? "Público" : "Privado"}
                        </span>
                        <button onClick={(event) => handleEditTrip(event, tripOwner)} type="button" className="btn btn-login d-flex align-items-center gap-2">
                          <i class="fa-solid fa-pen"></i> Editar viaje
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mostrar viajes en los que participipo */}
            <div className="mt-5">
              <h4 className="mb-3">Usuario</h4>
              <div className="row">
                {(userTrips || []).map((userTrip) => {
                  return (
                    <div className="col-md-6 col-lg-4 mb-3" key={userTrip.id}>
                      <div className="card shadow-sm" onClick={() => handleUserTripsDetails(userTrip)}>
                        {/* En el apartado src se podría traer una imagen del apartado stories, si no ya carga una imagen por defecto */}
                        <img
                          src=""
                          onError={handleImageError}
                          alt={`Foto del viaje ${userTrip.title}`}
                          className="card-img-top"
                          style={{ objectFit: "cover", height: "200px" }}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{userTrip.title}</h5>
                          <p className="card-text small">{userTrip.startDate}</p>
                          <p className="card-text small">{userTrip.endDate}</p>
                          <span className={`badge ${userTrip.isPublic ? "bg-success" : "bg-secondary"}`}>
                            {userTrip.isPublic ? "Público" : "Privado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div >
    </div>
  );
};
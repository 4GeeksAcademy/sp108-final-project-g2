const host = import.meta.env.VITE_BACKEND_URL

export const getTrips = async () => {

  //  Declarations
  const uri = `${host}/api/trips`
  const options = {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };

  /* Local Storage
  const tripsStorage = localStorage.getItem("trips-storage");
  if (tripsStorage) {
    return JSON.parse(tripsStorage);
  } */

  //  Fetch trips
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const tripsData = await response.json();
    localStorage.setItem("trips-storage", JSON.stringify({
      userTrips: tripsData.results.user_trips,
      tripsOwner: tripsData.results.trips_owner
    }));
    return {
      userTrips: tripsData.results.user_trips,
      tripsOwner: tripsData.results.trips_owner 
    };
  }
  catch {
    console.error("Error getting trips");
  }
};


export const postTrips = async (newTrip) => {
  const uri = `${host}/api/create-trip`;
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(newTrip),
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const tripPosted = await response.json();
    const storedTrips = JSON.parse(localStorage.getItem("trips-storage")) || [];
    storedTrips.tripOwner.push(tripPosted.results);
    localStorage.setItem("trips-storage", JSON.stringify(storedTrips));
    return tripPosted.results;
  }
  catch {
    console.error("Error posting trip");
  }
};

export const putTrip = async (tripId, tripToPut) => {
  const uri = `${host}/api/trips/${tripId}`;
  const options = {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(tripToPut),
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const tripPut = await response.json();
    console.log("Antes", tripPut);
    await getTrips()
    /* const storedTrips = JSON.parse(localStorage.getItem("trips-storage"));
    storedTrips.tripsOwner = storedTrips.tripsOwner.map(trip =>
      trip.id === tripId ? tripPut.results : trip);
    localStorage.setItem("trips-storage", JSON.stringify(storedTrips)); */
    console.log("Después", tripPut.result);
    return tripPut.result;
  }
  catch {
    console.error("Error putting trip");
  }
}

export const deleteTrip = async (tripToDelete) => {
  const uri = `${host}/api/trips/${tripToDelete.id}`;
  const options = {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  };
  try {
    const tripDeleted = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    localStorage.removeItem("current-user");
    return await getAgenda();
  }
  catch {
    console.error("Error deleting contact");
  }
};
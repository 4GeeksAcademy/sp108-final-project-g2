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

  // Local Storage
  const tripsStorage = localStorage.getItem("trips-storage");
  if (tripsStorage) {
    return JSON.parse(tripsStorage);
  }

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


export const postTrip = async (tripToPost) => {
  const uri = `${host}/api/create-trip`;
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(tripToPost),
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const tripPosted = await response.json();
    const storedTrips = JSON.parse(localStorage.getItem("trips-storage")) || {user_trips: [], tripsOwner: []};
    storedTrips.tripsOwner.push(tripPosted.results);
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
    console.log(tripPut)
    const storedTrips = JSON.parse(localStorage.getItem("trips-storage"));
    storedTrips.tripsOwner = storedTrips.tripsOwner.map(trip =>
      trip.id === tripId ? tripPut.results : trip);
    localStorage.setItem("trips-storage", JSON.stringify(storedTrips));
    return tripPut.results;
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
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
      return false;
    }
    const tripDeleted = tripToDelete
    const storedTrips = JSON.parse(localStorage.getItem("trips-storage"));
    storedTrips.tripsOwner = storedTrips.tripsOwner.filter(trip => trip.id !== tripDeleted.id);
    localStorage.setItem("trips-storage", JSON.stringify(storedTrips));
    return tripDeleted;
  }
  catch {
    console.error("Error deleting trip");
  }
};


export const getActivities = async (tripId) => {
  const uri = `${host}/api/trips/${tripId}/activities`
  const options = {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };
  /* const activitiesStorage = localStorage.getItem("activities-storage");
  if (activitiesStorage) {
    return JSON.parse(activitiesStorage);
  } */
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const activitiesData = await response.json();
    localStorage.setItem("activities-storage", JSON.stringify(activitiesData.results));
    return activitiesData.results;
  }
  catch {
    console.error(`Error getting activities`);
  }
};


export const postActivity = async (tripId, activityToPost) => {
  const uri = `${host}/api/trips/${tripId}/activities`;
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(activityToPost),
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const activityPosted = await response.json();
    /* const storedActivities = JSON.parse(localStorage.getItem("activities-storage")) || [];
    storedActivities.push(activityPosted.results);
    localStorage.setItem("activities-storage", JSON.stringify(storedActivities)); */
    return activityPosted.results;
  }
  catch {
    console.error("Error posting activity");
  }
};

export const putActivity = async (tripId, activityId, activityToPut) => {
  const uri = `${host}/api/trips/${tripId}/activities/${activityId}`;
  const options = {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(activityToPut),
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const activityPut = await response.json();
    /* const storedActivities = JSON.parse(localStorage.getItem("activities-storage"));
    storedActivities = storedActivities.map(activity =>
      activity.id === activityId ? activityPut.results : activity);
    localStorage.setItem("activities-storage", JSON.stringify(storedActivities)); */
    return activityPut.results;
  }
  catch {
    console.error("Error putting activity");
  }
}

export const deleteActivity = async (tripId, activityToDelete) => {
  const uri = `${host}/api/trips/${tripId}/activities/${activityToDelete.id}`;
  const options = {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
      return false;
    }
    const activityDeleted = activityToDelete
    /* const storedActivities = JSON.parse(localStorage.getItem("activities-storage"));
    storedActivities = storedActivities.filter(activity => activity.id !== activityDeleted.id);
    localStorage.setItem("activities-storage", JSON.stringify(storedActivities)); */
    return activityDeleted
  }
  catch {
    console.error("Error deleting activity");
  }
};
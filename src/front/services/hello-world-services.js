const host = import.meta.env.VITE_BACKEND_URL

export const getTrips = async () => {

  //  Declarations
  const uri = `${host}/trips`
  const options = {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  };

  //  Local Storage
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
    localStorage.setItem("trips-storage", JSON.stringify(tripsData.results));
    return tripsData.results;
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
    storedTrips.push(tripPosted.results);
    localStorage.setItem("trips-storage", JSON.stringify(storedTrips));
    return tripPosted.results;
  }
  catch {
    console.error("Error posting trip");
  }
};


/* export const getCharacterDetails = async (characterId) => {

  const uri = `${host}/people/${characterId}`
  const options = { method: "GET" };

  const characterDetailsStorage = localStorage.getItem(`character-details-storage-${characterId}`);
  if (characterDetailsStorage) {
    return JSON.parse(characterDetailsStorage);
  }

  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
    console.log(response.status, " error");
    }
    const characterDetailsData = await response.json();
    localStorage.setItem(`character-details-storage-${characterId}`, JSON.stringify(characterDetailsData.result.properties));
    return characterDetailsData.result.properties;
  }
  catch {
    console.error("Error getting character details");
  }
};

export const getPlanets = async () => {

  const uri = `${host}/planets`
  const options = { method: "GET" };

  const planetsStorage = localStorage.getItem(`planets-storage`);
  if (planetsStorage) {
    return JSON.parse(planetsStorage);
  }

  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
    console.log(response.status, " error");
    }
    const planetsData = await response.json();
    localStorage.setItem(`planets-storage`, JSON.stringify(planetsData.results));
    return planetsData.results;
  }
  catch {
    console.error("Error getting planets");
  }
};

export const getPlanetDetails = async (planetId) => {

  const uri = `${host}/planets/${planetId}`
  const options = { method: "GET" };

  const planetDetailsStorage = localStorage.getItem(`planet-details-storage-${planetId}`);
  if (planetDetailsStorage) {
    return JSON.parse(planetDetailsStorage);
  }

  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
    console.log(response.status, " error");
    }
    const planetDetailsData = await response.json();
    localStorage.setItem(`planet-details-storage-${planetId}`, JSON.stringify(planetDetailsData.result.properties));
    return planetDetailsData.result.properties;
  }
  catch {
    console.error("Error getting planet details");
  }
};

export const getStarships = async () => {

  const uri = `${host}/starships`
  const options = { method: "GET" };

  const starshipsStorage = localStorage.getItem(`starships-storage`);
  if (starshipsStorage) {
    return JSON.parse(starshipsStorage);
  }

  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
    console.log(response.status, " error");
    }
    const starshipsData = await response.json();
    localStorage.setItem(`starships-storage`, JSON.stringify(starshipsData.results));
    return starshipsData.results;
  }
  catch {
    console.error("Error getting starships");
  }
};

export const getStarshipDetails = async (starshipId) => {

  const uri = `${host}/starships/${starshipId}`
  const options = { method: "GET" };

  const starshipDetailsStorage = localStorage.getItem(`starship-details-storage-${starshipId}`);
  if (starshipDetailsStorage) {
    return JSON.parse(starshipDetailsStorage);
  }

  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
    console.log(response.status, " error");
    }
    const starshipDetailsData = await response.json();
    localStorage.setItem(`starship-details-storage-${starshipId}`, JSON.stringify(starshipDetailsData.result.properties));
    return starshipDetailsData.result.properties;
  }
  catch {
    console.error("Error getting starship details");
  }
}; */
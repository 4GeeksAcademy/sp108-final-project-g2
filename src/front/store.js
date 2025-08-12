export const initialStore = () => {
  const token = localStorage.getItem("token")
  const currentUser = localStorage.getItem("current-user")
  const currentUserFormatted = currentUser ? JSON.parse(currentUser) : {}
  return {
    login: {
      token: token,
      isLogged: token ? true : false
    },
    currentUser: currentUserFormatted,
    trips: {
      userTrips: [],
      tripsOwner: []
    },
    tripDetail: [],
    // formulario se renderiza si eres owner y meter correo electrónico. si el correo electrónico existe 
    activityDetail: []
    // modal para ver la imagen en grande

  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    case "LOGIN":
      return { ...store, login: action.payload };

    case "CURRENT-USER":
      return { ...store, currentUser: action.payload };

    case "GET-TRIPS":
      return { ...store, trips: action.payload };

    case "POST-TRIP":
      return {
        ...store, trips: {
          ...store.trips, tripsOwner: [
            ...store.trips.tripsOwner, action.payload]
        }
      };

    case "PUT-TRIP":
      return {
        ...store,
        trips: {
          ...store.trips, tripsOwner:
            store.trips.tripsOwner.map(trip =>
              trip.id === action.payload.id ? action.payload : trip
            )
        }
      };

    case "DELETE-TRIP":
      return {
        ...store,
        trips: {
          ...store.trips, tripsOwner:
            store.trips.tripsOwner.filter(trip => trip.id !== action.payload.id)
        }
      };

    case "GET-ACTIVITIES":
      return {
        ...store,
        tripDetail: [...store.tripDetail, action.payload]
      };

    default:
      throw Error('Unknown action.');

  };
};


export const initialStore = () => {
  return {
    login: {
      token: "",
      isLogged: false
    },
    currentUser: {},
    trips: [],
    tripsToPost: {},
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type) {

    case "LOGIN":
      return { ...store, login: action.payload };

    case "CURRENT-USER":
      return { ...store, currentUser: action.payload };

    case "GET-TRIPS":
      return { ...store, trips: action.payload };

    case "POST-TRIPS":
      return { ...store, tripsToPost: action.payload };
      
    default:
      return store;

    }    
}

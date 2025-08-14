// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store"  // Import the reducer and the initial state.


// Create a context to hold the global state of the application
// We will call this global state the "store" to avoid confusion while using local states
const StoreContext = createContext()


// Define a provider component that encapsulates the store and warps it in a context provider to 
// broadcast the information throught all the app pages and components.
export function StoreProvider({ children }) {
    // Initialize reducer with the initial state.
    /* const [store, dispatch] = useReducer(storeReducer, initialStore()) */


    const [store, dispatch] = useReducer(storeReducer, null, () => {
        const stored = localStorage.getItem("store");
        return stored ? JSON.parse(stored) : initialStore();
    });

    // Guardamos automáticamente la store en localStorage cada vez que cambie
    useEffect(() => {
        try {
            localStorage.setItem("store", JSON.stringify(store));
        } catch (error) {
            console.error("Error guardando la store en localStorage:", error);
        }
    }, [store]);


    // Provide the store and dispatch method to all child components.
    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}


// Custom hook to access the global state and dispatch function.
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}


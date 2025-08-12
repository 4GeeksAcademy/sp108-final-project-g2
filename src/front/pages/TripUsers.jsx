import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const TripUsers = () => {
  const { trip_id } = useParams(); // Obtenemos el ID del viaje desde la URL
  const navigate = useNavigate();
  const [state, dispatch] = useGlobalReducer(); // Accedemos al estado global
  const [users, setUsers] = useState([]); // Lista de usuarios del viaje
  const [email, setEmail] = useState(""); // Email para añadir nuevo usuario

  const backend = import.meta.env.VITE_BACKEND_URL; // URL del backend desde .env
  const token = localStorage.getItem("token"); // Token de autenticación

  //  Si no hay token, redirigimos al login
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  //  Cargar usuarios del viaje al montar el componente
  useEffect(() => {
    fetch(`${backend}/api/trips/${trip_id}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users); // Guardamos los usuarios en el estado
      })
      .catch(err => console.error("Error al cargar usuarios:", err));
  }, [trip_id]);

  //  Añadir usuario por email
  const handleAddUser = () => {
    fetch(`${backend}/api/trips/${trip_id}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        setUsers(prev => [...prev, data.user]); // Añadimos el nuevo usuario a la lista
        setEmail(""); // Limpiamos el campo
      })
      .catch(err => console.error("Error al añadir usuario:", err));
  };

  //  Eliminar usuario del viaje
  const handleRemoveUser = (user_id) => {
    fetch(`${backend}/api/trips/${trip_id}/users/${user_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          setUsers(prev => prev.filter(user => user.id !== user_id)); // Quitamos el usuario de la lista
        } else {
          console.error("Error al eliminar usuario");
        }
      })
      .catch(err => console.error("Error al eliminar usuario:", err));
  };

  return (
    <div>
      <h2>Usuarios del viaje</h2>

      {/* Campo para añadir usuario por email */}
      <input
        type="email"
        placeholder="Email del usuario"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleAddUser}>Añadir usuario</button>

      {/* Lista de usuarios */}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleRemoveUser(user.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

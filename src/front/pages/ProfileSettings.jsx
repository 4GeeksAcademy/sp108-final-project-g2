import React, { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { modifyUser, deleteUser } from "../services/auth.js"


export const ProfileSettings = () => {
	const navigate = useNavigate();
	const { user_id } = useParams();
	const { store, dispatch } = useGlobalReducer();
	const user = store.currentUser

	const [firstName, setFirstName] = useState(user.first_name);
	const [lastName, setLastName] = useState(user.last_name);

	const handleFirstName = event => setFirstName(event.target.value);
	const handleLastName = event => setLastName(event.target.value);

	const handleSubmitUser = async (event) => {
		event.preventDefault();
		const userToPut = {
			"first_name": firstName,
			"last_name": lastName
		};
		const userSettings = await modifyUser(user_id, userToPut);
		dispatch({
			type: "CURRENT-USER",
			payload: userSettings.results
		});
		localStorage.setItem("current-user", JSON.stringify(userSettings.results))
		navigate("/");
	}

	const handleDeleteUser = async () => {
		const userToDelete = await deleteUser(user_id);
		if (userToDelete) {
			dispatch({
				type: "CURRENT-USER",
				payload: userToDelete.results
			});
			localStorage.removeItem("token");
			localStorage.removeItem("current-user");
			localStorage.removeItem("trips-storage");
			localStorage.removeItem("activities-storage");
			dispatch({ type: "CLEAR" });
			navigate("/");
		} else {
			alert(`Credenciales inválidas`);
		}
	}

	const handleCancel = () => {
		navigate("/");
	}

	return (
		<div className="container mt-5 mb-5" style={{ maxWidth: "500px" }}>
			{/* Título con icono */}
			<div className="text-center mb-4">
				<i className="fas fa-cog fa-3x text-warning"></i>
				<h2 className="mt-2">Ajustes</h2>
			</div>

			<div className="p-5 pt-0">
				<form onSubmit={handleSubmitUser}>
					{/* Nombre */}
					<div className="mb-3 input-group">
						<span className="input-group-text">
							<i className="fas fa-user"></i>
						</span>
						<input
							type="text"
							className="form-control rounded-3"
							id="signUpFirstName"
							placeholder="Nombre"
							value={firstName}
							onChange={handleFirstName}
						/>
					</div>

					{/* Apellido */}
					<div className="mb-4 input-group">
						<span className="input-group-text">
							<i className="fas fa-user"></i>
						</span>
						<input
							type="text"
							className="form-control rounded-3"
							id="signUpLastName"
							placeholder="Apellido"
							value={lastName}
							onChange={handleLastName}
						/>
					</div>

					{/* Botón Guardar */}
					<div className="d-flex justify-content-between mt-3 text-center">
						<button type="submit" className="btn-login">
							<i className="fas fa-save me-2"></i>
							Guardar
						</button>
						<button onClick={handleCancel} type="button" className="btn-login">
							<i className="fas fa-times me-2"></i>
							Cancelar
						</button>
					</div>

					{/* Botón Eliminar */}
					<div className="d-grid mt-4">
						<button
							onClick={handleDeleteUser}
							type="button"
							className="btn btn btn-login bg-danger"
						>
							<i className="fas fa-trash me-2"></i> Eliminar usuario
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
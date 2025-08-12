import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { modifyUser, deleteUser } from "../services/auth.js";

export const ProfileSettings = () => {
	const navigate = useNavigate();
	const { user_id } = useParams();
	const { store, dispatch } = useGlobalReducer();
	const user = store.currentUser;

	const [firstName, setFirstName] = useState(user.first_name);
	const [lastName, setLastName] = useState(user.last_name);

	const handleFirstName = (event) => setFirstName(event.target.value);
	const handleLastName = (event) => setLastName(event.target.value);

	const handleSubmitUser = async (event) => {
		event.preventDefault();
		const userToPut = {
			first_name: firstName,
			last_name: lastName,
		};
		const userSettings = await modifyUser(user_id, userToPut);
		dispatch({
			type: "CURRENT-USER",
			payload: userSettings.results,
		});
		navigate("/");
	};

	const handleDeleteUser = async () => {
		const userToDelete = await deleteUser(user_id);
		if (userToDelete) {
			dispatch({
				type: "CURRENT-USER",
				payload: userToDelete.results,
			});
			dispatch({
				type: "LOGIN",
				payload: { token: "", isLogged: false },
			});
			localStorage.removeItem("token");
			navigate("/");
		} else {
			alert(`No se pudo eliminar al usuario ${user_id}`);
		}
	};

	const handleCancel = () => {
		setFirstName("");
		setLastName("");
		navigate("/");
	};

	return (
		<div className="container mt-5 mb-5" style={{ maxWidth: "500px" }}>
			{/* Título con icono */}
			<div className="text-center mb-4">
				<i className="fas fa-cog fa-3x text-warning"></i>
				<h2 className="mt-2">Ajustes</h2>
			</div>

			{/* Formulario */}
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
				<div className="d-grid mb-3">
					<button className="btn btn-login" type="submit">
						<i className="fas fa-save me-2"></i> Guardar cambios
					</button>
				</div>

				{/* Botón Eliminar */}
				<div className="d-grid mb-3">
					<button
						onClick={handleDeleteUser}
						type="button"
						className="btn btn btn-login"
					>
						<i className="fas fa-trash me-2"></i> Eliminar usuario
					</button>
				</div>

				{/* Botón Cancelar */}
				<div className="d-grid mb-3">
					<button
						onClick={handleCancel}
						type="button"
						className="btn btn-login"
					>
						<i className="fas fa-times me-2"></i> Cancelar
					</button>
				</div>
			</form>
		</div>
	);
};

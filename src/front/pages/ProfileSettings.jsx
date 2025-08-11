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
			dispatch({
				type: "LOGIN",
				payload: { token: "", isLogged: false }
			});
			localStorage.removeItem("current-user");
			localStorage.removeItem("token");
			navigate("/");
		} else {
			alert(`No se pudo eliminar al usuario ${user_id}`);
		}
	}

	const handleCancel = () => {
		setFirstName("");
		setLastName("");
		navigate("/");
	}

	return (
		<div className="d-flex justify-content-center my-4">
			<div className="col-10 col-md-6 col-lg-4 rounded-4 shadow">
				<div className="d-flex align-items-end justify-content-between p-5 pb-4 border-bottom-0">
					<h1 className="fw-bold mb-0 fs-2">Ajustes</h1>
					<button onClick={handleCancel} type="button" className="border-0 bg-transparent text-secondary">
						<i className="fa-solid fa-xmark fa-xl"></i>
					</button>
				</div>
				<div className="p-5 pt-0">
					<form onSubmit={handleSubmitUser}>
						<div className="mb-4">
							<label htmlFor="signUpFirstName" className="mb-2">Nombre</label>
							<input type="text" className="form-control rounded-3" id="signUpFirstName" placeholder="Your first name"
								value={firstName} onChange={handleFirstName} />
						</div>
						<div className="mb-4">
							<label htmlFor="signUpLastName" className="mb-2">Apellido</label>
							<input type="text" className="form-control rounded-3" id="signUpLastName" placeholder="Your last name"
								value={lastName} onChange={handleLastName} />
						</div>
						<button className="w-100 my-2 btn btn-lg rounded-3 btn-success" type="submit">Guardar cambios</button>
					</form>
					<button onClick={handleDeleteUser} type="button" className="btn btn-lg bg-danger text-white w-100 my-2 rounded-3">
						Eliminar usuario
					</button>
				</div>
			</div>
		</div>
	);
};
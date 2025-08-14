import React, { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth.js"

export const Register = () => {
	const navigate = useNavigate();
	const { dispatch } = useGlobalReducer();

	const [email, setEmail] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	const handleEmail = event => setEmail(event.target.value);
	const handlePassword1 = event => setPassword1(event.target.value);
	const handlePassword2 = event => setPassword2(event.target.value);
	const handleFirstName = event => setFirstName(event.target.value);
	const handleLastName = event => setLastName(event.target.value);

	const handleSubmitRegister = async (event) => {
		event.preventDefault();
		if (password1 == password2) {
			const userToPost = {
				"email": email,
				"password": password1,
				"first_name": firstName,
				"last_name": lastName
			};
			const userRegistered = await register(userToPost);
			dispatch({
				type: "CURRENT-USER",
				payload: userRegistered.results
			});
			dispatch({
				type: "LOGIN",
				payload: { token: userRegistered.access_token, isLogged: true }
			});
			localStorage.setItem("token", userRegistered.access_token);
			localStorage.setItem("current-user", JSON.stringify(userRegistered.results))
			navigate("/create-trip");
		} else {
			alert("Las contraseñas no coinciden");
		}
	}

	const handleCancel = () => {
		navigate("/");
	}

	return (
		<div className="container mt-5 mb-5" style={{ maxWidth: "500px" }}>
			<div className="text-center mb-4">
				<i className="fas fa-user-plus fa-3x text-warning"></i>
				<h2 className="mt-2">Crear cuenta</h2>
			</div>

			<form onSubmit={handleSubmitRegister}>

				{/* Nombre */}
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-user"></i>
					</span>
					<input type="text" className="form-control" placeholder="Nombre"
						value={firstName} onChange={handleFirstName} />
				</div>

				{/* Apellido */}
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-user"></i>
					</span>
					<input type="text" className="form-control" placeholder="Apellido"
						value={lastName} onChange={handleLastName} />
				</div>

				{/* Email */}
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-envelope"></i>
					</span>
					<input type="email" className="form-control" placeholder="Correo electrónico"
						value={email} onChange={handleEmail} />
				</div>

				{/* Contraseña */}
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-lock"></i>
					</span>
					<input type="password" className="form-control" placeholder="Contraseña"
						value={password1} onChange={handlePassword1} />
				</div>

				{/* Confirmar Contraseña */}
				<div className="mb-4 input-group">
					<span className="input-group-text">
						<i className="fas fa-lock"></i>
					</span>
					<input type="password" className="form-control" placeholder="Confirmar contraseña"
						value={password2} onChange={handlePassword2} />
				</div>

				{/* Botón Registro y Cancel */}
				<div className="d-flex justify-content-between mt-3 text-center">
					<button type="submit" className="btn-login">
						<i className="fas fa-user-plus me-2"></i>
						Registrarse
					</button>
					<button onClick={handleCancel} type="button" className="btn-login">
						<i className="fas fa-times me-2"></i>
						Cancelar
					</button>
				</div>

				{/* Enlace a Login */}
				<div className="mt-3 text-center">
					<small>
						¿Ya tienes una cuenta? <Link to="/login">Loguéate aquí</Link>
					</small>
				</div>

			</form>
		</div>
	);
};

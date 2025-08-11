import React, { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth.js"

export const Login = () => {
	const navigate = useNavigate();
	const { dispatch } = useGlobalReducer();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleEmail = event => setEmail(event.target.value);
	const handlePassword = event => setPassword(event.target.value);

	const handleSubmitLogin = async (event) => {
		event.preventDefault();
		const userToLogin = {
			"email": email,
			"password": password,
		}
		const userLogged = await login(userToLogin);
		if (userLogged) {
			dispatch({
				type: "CURRENT-USER",
				payload: userLogged.results
			});
			dispatch({
				type: "LOGIN",
				payload: { token: userLogged.access_token, isLogged: true }
			});
			localStorage.setItem("token", userLogged.access_token);
			localStorage.setItem("current-user", JSON.stringify(userLogged.results))
			navigate("/");
		} else {
			alert("Credenciales inválidas")
		}

	}

	const handleCancel = () => {
		setEmail("");
		setPassword("");
		navigate("/");
	}

	return (
		<div className="container mt-5 mb-5" style={{ maxWidth: "500px" }}>
			<div className="text-center mb-4">
				<i className="fas fa-sign-in-alt fa-3x text-warning"></i>
				<h2 className="mt-2">Iniciar sesión</h2>
			</div>

			<form onSubmit={handleSubmitLogin}>

				{/* Email */}
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-envelope"></i>
					</span>
					<input type="email" className="form-control rounded-3" id="loginEmail" placeholder="Correo electrónico"
						value={email} onChange={handleEmail} />
				</div>

				{/* Contraseña */}
				<div className="mb-4 input-group">
					<span className="input-group-text">
						<i className="fas fa-lock"></i>
					</span>
					<input type="password" className="form-control rounded-3" id="loginPassword" placeholder="Contraseña"
						value={password} onChange={handlePassword} />
				</div>

				{/* Botón Login y Cancel*/}
				<div className="d-grid mb-3">
					<button className="btn btn-login" type="submit">
						<i className="fas fa-user me-2"></i> Iniciar sesión
					</button>
					<button onClick={handleCancel} type="button" className="btn bg-secondary text-white">
						Cancel
					</button>
				</div>

				{/* Enlace a registro */}
				<div className="text-center">
					<small>
						¿No tienes una cuenta?
						<Link to="/register"> Regístrate aquí</Link>
					</small>
				</div>
			</form>
		</div>
	);
};


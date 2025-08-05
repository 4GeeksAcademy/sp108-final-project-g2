import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Register = () => {
	const [form, setForm] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: ""
	});

	const navigate = useNavigate();

	const handleChange = e => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = e => {
		e.preventDefault();
		// Aquí luego llamaremos a la API para registrar
		console.log("Formulario enviado:", form);
	};

	return (
		<div className="container mt-5 mb-5" style={{ maxWidth: "500px" }}>
			<div className="text-center mb-4">
				<i className="fas fa-user-plus fa-3x text-warning"></i>
				<h2 className="mt-2">Crear cuenta</h2>
			</div>
			<form onSubmit={handleSubmit}>

				{/* Nombre */}
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-user"></i>
					</span>
					<input type="text" className="form-control" placeholder="Nombre completo" />
				</div>
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-envelope"></i>
					</span>
					<input type="email" className="form-control" placeholder="Correo electrónico" />
				</div>

				{/* Contraseña */}
				<div className="mb-3 input-group">
					<span className="input-group-text">
						<i className="fas fa-lock"></i>
					</span>
					<input type="password" className="form-control" placeholder="Contraseña" />
				</div>

				{/* Confirmar Contraseña */}
				<div className="mb-4 input-group">
					<span className="input-group-text">
						<i className="fas fa-lock"></i>
					</span>
					<input type="password" className="form-control" placeholder="Confirmar contraseña" />
				</div>

				<button type="submit" className="btn-login">
  <i className="fas fa-user-plus me-2"></i> Registrarse
</button>


				<div className="mt-3 text-center">
					<p>
						¿Ya tienes una cuenta?{" "}
						
					</p>
				</div>

			</form>
		</div>
	);
};

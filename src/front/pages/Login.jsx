import React from "react";

export const Login = () => {
	return (
		<div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
			<div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px', borderRadius: '20px' }}>
				<div className="text-center mb-4">
					<i className="fas fa-sign-in-alt fa-3x text-warning"></i>
					<h2 className="mt-2">Iniciar sesión</h2>
				</div>

				<form>
					{/* Email */}
					<div className="mb-3 input-group">
						<span className="input-group-text">
							<i className="fas fa-envelope"></i>
						</span>
						<input
							type="email"
							className="form-control"
							placeholder="Correo electrónico"
						/>
					</div>

					{/* Contraseña */}
					<div className="mb-4 input-group">
						<span className="input-group-text">
							<i className="fas fa-lock"></i>
						</span>
						<input
							type="password"
							className="form-control"
							placeholder="Contraseña"
						/>
					</div>

					{/* Botón */}
					<div className="d-grid mb-3">
						<button className="btn-login">
							<i className="fas fa-user me-2"></i> Iniciar sesión
						</button>
					</div>

					{/* Enlace a registro */}
					<div className="text-center">
						<small>
							¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
						</small>
					</div>
				</form>
			</div>
		</div>
	);
};


import React from "react"
import { Link } from "react-router-dom";

export const Footer = () => {
	return (
		<footer className="footer-container text-white">
			<div className="footer-content">
				<div className="footer-section">
					<h4 className="text-warning fw-bold">Viaja Con Nosotros</h4>
					<p>Planifica, comparte y vive aventuras inolvidables</p>
				</div>

				{/* <div className="footer-section">
					<h5 className="text-warning fw-semibold mb-2">Enlaces útiles</h5>
					<ul className="list-unstyled">
						<li><Link to="/trips" className="text-light text-decoration-none">Mis viajes</Link></li>
						<li><Link to="/create-trip" className="text-light text-decoration-none">Crear Viaje</Link></li>
						<li><Link to="/contact" className="text-light text-decoration-none">Contacto</Link></li>
					</ul>
				</div> */}

				<div className="footer-section">
					<h5 className="text-warning fw-semibold mb-2">Síguenos</h5>
					<div className="d-flex gap-3">
						<i className="fa-brands fa-facebook"></i>
						<i className="fa-brands fa-x-twitter"></i>
						<i className="fa-brands fa-instagram"></i>
					</div>
				</div>
			</div>

			<hr className="border-secondary my-3" />

			<div className="text-center text-warning mt-2">
				<p className="mb-0">© {new Date().getFullYear()} sp108-final-project-g2</p>
			</div>
		</footer>
	);
};

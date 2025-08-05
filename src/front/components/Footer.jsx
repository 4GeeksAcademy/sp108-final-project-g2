import React from "react"

export const Footer = () => {
	return (
		<footer className="footer-container text-white">
			<div className="footer-content">
				<div className="footer-section">
					<h4 className="text-warning fw-bold">Viaja Con Nosotros</h4>
					<p>Planifica, comparte y vive aventuras inolvidables.</p>
				</div>

				<div className="footer-section">
					<h5 className="text-warning fw-semibold mb-2">Enlaces útiles</h5>
					<ul className="list-unstyled">
						<li><a className="text-light text-decoration-none" href="/trips">Mis viajes</a></li>
						<li><a className="text-light text-decoration-none" href="/trips/new">Crear viaje</a></li>
						<li><a className="text-light text-decoration-none" href="/about">Sobre nosotros</a></li>
						<li><a className="text-light text-decoration-none" href="/contact">Contacto</a></li>
					</ul>
				</div>

				<div className="footer-section">
					<h5 className="text-warning fw-semibold mb-2">Síguenos</h5>
					<div className="d-flex gap-3">
						<i className="fa-brands fa-facebook"></i>
						<i class="fa-brands fa-x-twitter"></i>
						<i class="fa-brands fa-instagram"></i>
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

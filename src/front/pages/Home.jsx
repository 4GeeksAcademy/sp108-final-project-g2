import { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import tripPlanningLogo from "../assets/img/trip_planning.png";


export const Home = () => {
	const { store, dispatch } = useGlobalReducer();

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			if (!backendUrl) {
				throw new Error('VITE_BACKEND_URL is not defined in .env file');
			}
			const response = await fetch(`${backendUrl}/api/hello`);
			if (response.ok) {
				const data = await response.json();
				dispatch({ type: 'set_hello', payload: data.message });
				return data;
			}
		} catch (error) {
			if (error.message) {
				throw new Error(
					`Could not fetch the message from the backend.
				   Please check if the backend is running and the backend port is public.`
				);
			}
		}
	}

	useEffect(() => {
		loadMessage();
	}, []);

	const carouselImages = [
		{
			url: "https://images.pexels.com/photos/7368269/pexels-photo-7368269.jpeg",
			title: "Explora el mundo",
			btnText: "Crear Viaje",
			btnLink: "/trips/new"
		},
		{
			url: "https://images.pexels.com/photos/413960/pexels-photo-413960.jpeg",
			title: "Aventuras inolvidables",
			btnText: "Crear Viaje",
			btnLink: "/trips/new"
		},
		{
			url: "https://images.pexels.com/photos/804463/pexels-photo-804463.jpeg",
			title: "Crea recuerdos",
			btnText: "Crear Viaje",
			btnLink: "/trips/new"
		}
	];

	return (
		<>
			{/* Carrusel */}

			<div
				id="carouselExampleIndicators"
				className="carousel slide"
				data-bs-ride="carousel"
			>
				<div className="carousel-indicators">
					{carouselImages.map((_, idx) => (
						<button
							key={idx}
							type="button"
							data-bs-target="#carouselExampleIndicators"
							data-bs-slide-to={idx}
							className={idx === 0 ? "active" : ""}
							aria-current={idx === 0 ? "true" : undefined}
							aria-label={`Slide ${idx + 1}`}
						></button>
					))}
				</div>

				<div className="carousel-inner">
					{carouselImages.map(({ url, title, btnText, btnLink }, idx) => (
						<div
							key={idx}
							className={`carousel-item ${idx === 0 ? "active" : ""}`}
						>
							<img
								src={url}
								className="d-block w-100 carousel-image"
								alt={title}
							/>
							<div className="carousel-caption">
								<h2 className="fw-bold">{title}</h2>
								<a href={btnLink} className="btn-shared mt-3">
									{btnText}
								</a>

							</div>
						</div>
					))}
				</div>

				<button
					className="carousel-control-prev"
					type="button"
					data-bs-target="#carouselExampleIndicators"
					data-bs-slide="prev"
				>
					<span
						className="carousel-control-prev-icon"
						aria-hidden="true"
					></span>
					<span className="visually-hidden">Anterior</span>
				</button>
				<button
					className="carousel-control-next"
					type="button"
					data-bs-target="#carouselExampleIndicators"
					data-bs-slide="next"
				>
					<span
						className="carousel-control-next-icon"
						aria-hidden="true"
					></span>
					<span className="visually-hidden">Siguiente</span>
				</button>
			</div>

			<section className="cta-section">
				<div className="cta-container">
					<h2 className="cta-title">Empieza a planificar tu próxima aventura</h2>
					<p className="cta-subtitle">
						Descubre, organiza y comparte tu viaje ideal en minutos.
					</p>
					<div className="center-button-container">
						<button onClick={() => navigate('/register')} className="btn-shared">
							¡Empieza tu aventura!
						</button>
					</div>

				</div>
			</section>
			<section className="benefits-section">
				<h2 className="section-title">¿Por qué usar nuestra app?</h2>
				<div className="benefits-cards">
					<div className="benefit-card">
						<img src="https://cdn-icons-png.flaticon.com/512/854/854878.png" alt="icono 1" />
						<h3>Planifica con facilidad</h3>
						<p>Organiza todos tus destinos, actividades y alojamientos en un solo lugar.</p>
					</div>
					<div className="benefit-card">
						<img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="icono 2" />
						<h3>Colabora con amigos</h3>
						<p>Invita a otros a unirse a tus viajes y hacer planes juntos en tiempo real.</p>
					</div>
					<div className="benefit-card">
						<img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="icono recuerdos" />
						<h3>Guarda tus recuerdos</h3>
						<p>Captura cada momento de tus viajes guardando fotos y vídeos de tus aventuras para revivirlos cuando quieras.</p>
					</div>

				</div>
			</section>

		</>
	);
};
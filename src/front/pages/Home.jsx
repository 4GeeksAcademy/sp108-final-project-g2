import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [publicTrips, setPublicTrips] = useState([]);

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
  };

  useEffect(() => {
    loadMessage();

    // Simulación de viajes públicos aleatorios
    const simulatedPublicTrips = [
      {
        id: 1,
        name: "Safari en Kenia",
        image: "https://images.pexels.com/photos/215692/pexels-photo-215692.jpeg",
      },
      {
        id: 2,
        name: "Aventura en Islandia",
        image: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg",
      },
      {
        id: 3,
        name: "Tour por Tokio",
        image: "https://images.pexels.com/photos/4006180/pexels-photo-4006180.jpeg",
      },
      {
        id: 4,
        name: "Escapada a Roma",
        image: "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg",
      },
      {
        id: 5,
        name: "Playas de Tailandia",
        image: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
      }
    ];

    // Mezclar aleatoriamente
    setPublicTrips(simulatedPublicTrips.sort(() => Math.random() - 0.5));
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

  const handleStartAdventure = () => {
    if (store.isLoggedIn) {
      navigate('/create-trip');
    } else {
      navigate('/login');
    }
  };

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
          {carouselImages.map(({ url, title, }, idx) => (
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
                <h2 className="fw-bold text-white text-shadow ">{title}</h2> 
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev "
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
            <button onClick={handleStartAdventure} className="btn-shared">
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

      {/* Sección Inspiración */}
      <section className="inspiration-section py-5 bg-light">
        <div className="container py-5">
          <h2 className="text-center mb-4">Inspiración</h2>

          <div className="row g-4">
            {[...Array(6)].map((_, index) => (
              <div className="col-12 col-sm-6 col-md-4" key={index}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={`https://picsum.photos/300/200?random=${index}`}
                    className="card-img-top"
                    alt={`Destino ${index + 1}`}
                  />
                  <div className="card-body">
                    <h5 className="card-title">Destino {index + 1}</h5>
                    <p className="card-text">
                      Descripción breve del destino {index + 1}.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

import { Link } from "react-router-dom";
import tripPlanningLogo from "../assets/img/trip_planning.png";


export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container my-2">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img src={tripPlanningLogo} alt="Trip Planning Logo" className="logo" />
        </Link>

        {/* Botón hamburguesa para móvil */}
        <button
          className="navbar-toggler custom-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menú colapsable */}
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link text-white">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/trips" className="nav-link text-white">
                Mis Viajes
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/activities" className="nav-link text-white">
                Actividades
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/my-stories" className="nav-link text-white">
                Stories
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link text-white">
                Contact
              </Link>
            </li>

            {/* Dropdown favoritos 
            <li className="nav-item dropdown">
              <button
                className="btn nav-link dropdown-toggle btn-link text-white"
                id="favoritesDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Favorites
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="favoritesDropdown"
              >
                <li className="dropdown-item text-muted">No favorites yet</li>
              </ul>
            </li>*/}
          </ul>

          {/* Botones a la derecha */}
          <div className="d-flex">
            <Link to="/login" className="btn btn-login d-flex align-items-center gap-2">
              <i className="fa-solid fa-circle-user"></i>
              Iniciar sesión
            </Link>

            <Link to="/register" className="btn btn-signup d-flex align-items-center gap-2">
              <i className="fa-solid fa-user-plus"></i>
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};


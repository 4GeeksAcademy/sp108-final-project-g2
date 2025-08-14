import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import tripPlanningLogo from "../assets/img/trip_planning.png";


export const Navbar = () => {

  //  Declatations
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const userLogged = store.login.isLogged

  // Función para cerrar menú colapsable en móvil
  const closeMenu = () => {
    const navbar = document.getElementById("navbarNavDropdown");
    if (navbar && navbar.classList.contains("show")) {
      new window.bootstrap.Collapse(navbar).hide();
    }
  };

  //  Handlers
  const handleLogIn = () => {
    if (userLogged) {
      localStorage.removeItem("token");
      localStorage.removeItem("current-user");
      localStorage.removeItem("trips-storage");
      localStorage.removeItem("activities-storage");
      dispatch({ type: "CLEAR" });
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const handleRegister = () => {
    if (userLogged) {
      const userId = store.currentUser.id;
      navigate(`/users/${userId}`);
    } else {
      navigate("/register");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container my-2">

        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img
            src={tripPlanningLogo}
            alt="Trip Planning Logo"
            className="logo"
          />
        </Link>

        {/* Botón hamburguesa */}
        {userLogged && (
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
        )}

        {/* Menú central*/}
        {userLogged && (
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  to="/"
                  className="nav-link text-white"
                  onClick={closeMenu}>
                  Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/trips"
                  className="nav-link text-white"
                  onClick={closeMenu}>
                  Mis Viajes 
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/create-trip"
                  className="nav-link text-white"
                  onClick={closeMenu}>
                  Crear Viaje
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link
                  to="/activities"
                  className="nav-link text-white"
                  onClick={closeMenu}>
                  Actividades
                </Link>
              </li> */}
              {/* <li className="nav-item">
                <Link
                  to="/my-stories"
                  className="nav-link text-white"
                  onClick={closeMenu}>
                  Stories
                </Link>
              </li> */}
              {/* <li className="nav-item">
                <Link
                  to="/contact"
                  className="nav-link text-white"
                  onClick={closeMenu}>
                  Contact
                </Link>
              </li> */}
            </ul>
          </div>
        )}

        {/* Botones a la derecha */}
        <div className="d-flex gap-3">
          {userLogged ?
            <button
              onClick={() => {
                handleLogIn();
                closeMenu();
              }}
              type="button"
              className="btn btn-login d-flex align-items-center px-3">
              <i className="fa-solid fa-arrow-right-from-bracket fa-2xs"></i>
              Cerrar sesión
            </button>
            :
            <button
              onClick={() => {
                handleLogIn();
                closeMenu();
              }}
              type="button"
              className="btn btn-login d-flex align-items-center px-3">
              <i className="fa-solid fa-right-to-bracket fa-2xs"></i>
              Iniciar sesión
            </button>}
            {userLogged ?
            <button
              onClick={() => {
                handleRegister();
                closeMenu();
              }}
              type="button"
              className="btn btn-login d-flex align-items-center">
              <i className="fas fa-cog"></i>
              Ajustes
            </button>
            :
            <button
              onClick={() => {
                handleRegister();
                closeMenu();
              }}
              type="button"
              className="btn btn-login d-flex align-items-center">
              <i className="fas fa-user-plus fa-2xs py-2"></i>
              Registrarse
            </button>}
        </div>
      </div>
    </nav>
  );
};
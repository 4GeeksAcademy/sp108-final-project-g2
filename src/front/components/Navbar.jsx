import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import tripPlanningLogo from "../assets/img/trip_planning.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  // Función para cerrar menú colapsable en móvil
  const closeMenu = () => {
    const navbar = document.getElementById("navbarNavDropdown");
    if (navbar && navbar.classList.contains("show")) {
      new window.bootstrap.Collapse(navbar).hide();
    }
  };

  // Handler para login/logout
  const handleLogIn = () => {
    if (store.login.isLogged) {
      localStorage.removeItem("token");
      localStorage.removeItem("current-user");
      localStorage.removeItem("trips-storage");
      dispatch({
        type: "LOGIN",
        payload: { token: "", isLogged: false },
      });
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  // Handler para registro/ajustes
 const handleRegister = () => {
  if (store.login.isLogged) {
    if (!store.currentUser) {
      console.warn("No hay usuario cargado, intentando restaurar...");
      const savedUser = localStorage.getItem("current-user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: "CURRENT-USER", payload: user });
        navigate(`/users/${user.id}`);
        return;
      }
      console.error("No se pudo recuperar el usuario");
      return;
    }
    navigate(`/users/${store.currentUser.id}`);
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

        {/* Botón hamburguesa solo si está logueado */}
        {store.login.isLogged && (
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

        {/* Menú central (solo si está logueado) */}
        {store.login.isLogged && (
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link text-white" onClick={closeMenu}>
                  Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/create-trip"
                  className="nav-link text-white"
                  onClick={closeMenu}
                >
                  Crear Viaje
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/trips"
                  className="nav-link text-white"
                  onClick={closeMenu}
                >
                  Mis Viajes
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/activities"
                  className="nav-link text-white"
                  onClick={closeMenu}
                >
                  Actividades
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/stories"
                  className="nav-link text-white"
                  onClick={closeMenu}
                >
                  Stories
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/contact"
                  className="nav-link text-white"
                  onClick={closeMenu}
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Botones a la derecha */}
        <div className="d-flex gap-3">
          <button
            onClick={() => {
              handleLogIn();
              closeMenu();
            }}
            type="button"
            className="btn btn-login d-flex align-items-center gap-2"
          >
            <i className="fas fa-arrow-right-to-bracket fa-sm"></i>
            {store.login.isLogged ? "Cerrar sesión" : "Iniciar sesión"}
          </button>

          <button
            onClick={() => {
              handleRegister();
              closeMenu();
            }}
            type="button"
            className="btn btn-signup d-flex align-items-center gap-2"
          >
            <i
              className={
                store.login.isLogged
                  ? "fas fa-cog fa-sm"
                  : "fas fa-user-plus fa-lg"
              }
            ></i>
            {store.login.isLogged ? "Ajustes" : "Registrarse"}
          </button>
        </div>
      </div>
    </nav>
  );
};

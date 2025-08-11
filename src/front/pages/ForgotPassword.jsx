import React, { useState } from "react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage(`Si el correo ${email} está registrado, recibirás instrucciones para recuperar tu contraseña.`);
      } else {
        const errorData = await response.json();
        setError(true);
        setMessage(errorData.message || "Inténtalo nuevamente más tarde.");
      }
    } catch {
      setError(true);
      setMessage("Error en la conexión con el servidor. Inténtalo más tarde.");
    }

    setLoading(false);
    setEmail("");
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">
        <i className="fas fa-key me-2 text-warning"></i> Recuperar contraseña
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 input-group">
          <span className="input-group-text">
            <i className="fas fa-envelope"></i>
          </span>
          <input
            type="email"
            className="form-control"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-login" disabled={loading}>
          {loading ? (
            "Enviando..."
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i> Restablecer Contraseña
            </>
          )}
        </button>
      </form>

      {message && (
        <div className={`alert mt-3 ${error ? "alert-danger" : "alert-info"}`} role="alert">
          {message}
        </div>
      )}
    </div>
  );
};

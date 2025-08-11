import React, { useEffect, useRef, useState } from "react";

export const Map = ({ apiKey, destination, activities = [], onAddActivity }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const placesServiceRef = useRef(null);

  // Estado para guardar place seleccionado y detalles
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Inicializar mapa y servicio Places
  useEffect(() => {
    function initMap() {
      if (!mapRef.current || mapInstance.current) return;

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.4168, lng: -3.7038 }, // Madrid
        zoom: 12,
      });

      placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstance.current);

      mapInstance.current.addListener("click", (e) => {
        const latLng = e.latLng;

        // Buscar lugar cercano
        placesServiceRef.current.nearbySearch(
          {
            location: latLng,
            radius: 50, // 50 metros
            rankBy: window.google.maps.places.RankBy.PROMINENCE,
          },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
              const place = results[0];
              // Obtener detalles completos
              placesServiceRef.current.getDetails({ placeId: place.place_id }, (details, status2) => {
                if (status2 === window.google.maps.places.PlacesServiceStatus.OK) {
                  // Guardar info completa
                  setSelectedPlace(details);
                } else {
                  alert("Error al obtener detalles del lugar");
                }
              });
            } else {
              alert("No se encontró un lugar cercano, puedes crear una actividad manual");
            }
          }
        );
      });
    }

    // Carga script Google Maps
    if (!window.google && apiKey) {
      const existing = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__initMap`;
        script.async = true;
        script.defer = true;
        window.__initMap = () => {
          initMap();
        };
        document.head.appendChild(script);
      } else {
        const check = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(check);
            initMap();
          }
        }, 200);
      }
    } else if (window.google && window.google.maps) {
      initMap();
    }

    return () => {
      try {
        delete window.__initMap;
      } catch {}
    };
  }, [apiKey]);

  // Sincronizar marcadores con actividades
  useEffect(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (!mapInstance.current) return;

    activities.forEach((act) => {
      if (!act.placeInfo?.lat || !act.placeInfo?.lng) return;

      const marker = new window.google.maps.Marker({
        position: { lat: Number(act.placeInfo.lat), lng: Number(act.placeInfo.lng) },
        map: mapInstance.current,
        title: act.name || "",
      });
      const infowindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${(act.name || "").replace(/</g, "&lt;")}</strong><br/>
                  ${act.placeInfo.address ? act.placeInfo.address : ""}
                  </div>`,
      });
      marker.addListener("click", () => {
        infowindow.open({ anchor: marker, map: mapInstance.current, shouldFocus: false });
      });
      markersRef.current.push(marker);
    });
  }, [activities]);

  // Función para confirmar y enviar actividad desde modal (la recibe padre)
  const confirmActivity = (time) => {
    if (!selectedPlace) return;
    onAddActivity({
      id: Date.now(),
      name: selectedPlace.name,
      time,
      description: selectedPlace.formatted_address || "",
      completed: false,
      source: "map",
      placeInfo: {
        place_id: selectedPlace.place_id,
        address: selectedPlace.formatted_address,
        url: selectedPlace.url,
        photoUrl:
          selectedPlace.photos && selectedPlace.photos.length > 0
            ? selectedPlace.photos[0].getUrl()
            : null,
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng(),
      },
    });
    setSelectedPlace(null);
  };

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: 400 }}></div>

      {/* Modal simple para confirmar info */}
      {selectedPlace && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 15,
            maxWidth: 320,
            zIndex: 1000,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <h5>{selectedPlace.name}</h5>
          {selectedPlace.photos && selectedPlace.photos.length > 0 && (
            <img
              src={selectedPlace.photos[0].getUrl()}
              alt={selectedPlace.name}
              style={{ width: "100%", borderRadius: 6, marginBottom: 10 }}
            />
          )}
          <p>{selectedPlace.formatted_address}</p>
          <p>
            <a href={selectedPlace.url} target="_blank" rel="noreferrer">
              Ver en Google Maps
            </a>
          </p>

          <label>
            Hora de la actividad:
            <input
              type="time"
              onChange={(e) => setSelectedPlace((p) => ({ ...p, userTime: e.target.value }))}
              value={selectedPlace.userTime || ""}
              style={{ marginLeft: 10 }}
            />
          </label>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => confirmActivity(selectedPlace.userTime || null)}
              className="btn btn-login me-2"
            >
              Añadir actividad
            </button>
            <button
              onClick={() => setSelectedPlace(null)}
              className="btn btn-outline-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

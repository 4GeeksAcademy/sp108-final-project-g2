import React, { useEffect, useRef } from "react";

/*
Props:
 - apiKey
 - destination
 - activities (opcional; se usan para dibujar marcadores)
 - onAddActivity (función) -> signature: (activity) => void
*/

export const Map = ({ apiKey, destination, activities = [], onAddActivity }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Cargar script e inicializar mapa (solo una vez por apiKey)
  useEffect(() => {
    function initMap() {
      if (!mapRef.current || mapInstance.current) return;

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.4168, lng: -3.7038 },
        zoom: 6,
      });

      // listener de clic para crear actividad y notificar al padre
      mapInstance.current.addListener("click", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Pedimos nombre (prompt para simplicidad)
        const name = window.prompt("Nombre de la actividad (Cancelar para abortar):");
        if (!name) return;

        const activity = { name: name.trim(), lat, lng };

        // Crear marcador local inmediato para feedback visual
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
          title: activity.name,
        });

        // Guardar marcador en memoria (se limpiará cuando activities cambien)
        markersRef.current.push(marker);

        // Notificar al componente padre para que guarde la actividad (en state y en trip)
        if (typeof onAddActivity === "function") {
          onAddActivity(activity);
        }
      });
    }

    function geocodeAddress(address) {
      if (!address || !window.google) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          mapInstance.current.setCenter(results[0].geometry.location);
          mapInstance.current.setZoom(12);
        } else {
          console.warn("Geocoding status:", status);
        }
      });
    }

    // Cargar script una vez
    if (!window.google && apiKey) {
      const existing = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__initMap`;
        script.async = true;
        script.defer = true;
        window.__initMap = () => {
          initMap();
          geocodeAddress(destination);
        };
        document.head.appendChild(script);
      } else {
        const check = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(check);
            initMap();
            geocodeAddress(destination);
          }
        }, 200);
      }
    } else if (window.google && window.google.maps) {
      initMap();
      geocodeAddress(destination);
    }

    return () => {
      try {
        delete window.__initMap;
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Effect para sincronizar marcadores con array activities (cuando cambia)
  useEffect(() => {
    // limpiar marcadores anteriores
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!mapInstance.current) return;

    activities.forEach((act) => {
      const marker = new window.google.maps.Marker({
        position: { lat: Number(act.lat), lng: Number(act.lng) },
        map: mapInstance.current,
        title: act.name || "",
      });

      const infowindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${(act.name || "").replace(/</g, "&lt;")}</strong><br/><small>Lat:${act.lat.toFixed(5)}, Lng:${act.lng.toFixed(5)}</small></div>`,
      });

      marker.addListener("click", () => {
        infowindow.open({ anchor: marker, map: mapInstance.current, shouldFocus: false });
      });

      markersRef.current.push(marker);
    });

    // si hay actividades, centra en la última
    if (activities.length > 0) {
      const last = activities[activities.length - 1];
      mapInstance.current.panTo({ lat: Number(last.lat), lng: Number(last.lng) });
      mapInstance.current.setZoom(14);
    }
  }, [activities]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "100%" }} />;
};

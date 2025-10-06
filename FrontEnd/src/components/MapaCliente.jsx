// FrontEnd/src/components/MapaCliente.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importar icono de marcador (necesario para evitar error 404)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapaCliente = ({ latitud, longitud, clienteNombre }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const tileLayerInstance = useRef(null);

    useEffect(() => {
        // Validar coordenadas
        if (latitud == null || longitud == null || isNaN(latitud) || isNaN(longitud)) {
            console.warn("Coordenadas inválidas para el mapa:", latitud, longitud);
            return;
        }

        // Si el mapa ya existe, limpiarlo antes de crear uno nuevo
        if (mapInstance.current) {
            if (markerInstance.current) {
                markerInstance.current.remove();
                markerInstance.current = null;
            }
            if (tileLayerInstance.current) {
                tileLayerInstance.current.remove();
                tileLayerInstance.current = null;
            }
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        // Verificar que el contenedor DOM exista
        if (!mapRef.current) {
            console.error("El contenedor del mapa no está disponible.");
            return;
        }

        try {
            // Crear nuevo mapa
            mapInstance.current = L.map(mapRef.current, {
                center: [latitud, longitud],
                zoom: 15,
                zoomControl: true,
                attributionControl: true
            });

            // Añadir capa de teselas
            tileLayerInstance.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            // Crear marcador con popup
            const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
            const popupContent = `
                <b>${clienteNombre || 'Cliente'}</b><br>
                Lat: ${latitud.toFixed(4)}<br>
                Lng: ${longitud.toFixed(4)}<br>
                <a href="${urlGoogleMaps}" target="_blank" rel="noopener noreferrer" 
                   style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px;">
                   📍 Navegar (Mapa)
                </a>
            `;

            markerInstance.current = L.marker([latitud, longitud])
                .addTo(mapInstance.current)
                .bindPopup(popupContent)
                .openPopup();

        } catch (error) {
            console.error("Error al inicializar el mapa de Leaflet:", error);
        }

        // Cleanup: destruir instancias al desmontar el componente o cambiar las props
        return () => {
            if (markerInstance.current) {
                markerInstance.current.remove();
                markerInstance.current = null;
            }
            if (tileLayerInstance.current) {
                tileLayerInstance.current.remove();
                tileLayerInstance.current = null;
            }
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [latitud, longitud, clienteNombre]); // Dependencias: se ejecuta si cambian

    return (
        <div>
            <h4>📍 Ubicación del Cliente</h4>
            <div
                ref={mapRef}
                style={{
                    height: '400px',
                    width: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}
            />
        </div>
    );
};

export default MapaCliente;
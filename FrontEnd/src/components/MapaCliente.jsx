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

    useEffect(() => {
        if (!latitud || !longitud) return;

        // Destruir mapa anterior si existe
        if (mapInstance.current) {
            mapInstance.current.remove();
        }

        // Crear nuevo mapa
        mapInstance.current = L.map(mapRef.current).setView([latitud, longitud], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        L.marker([latitud, longitud])
            .addTo(mapInstance.current)
            .bindPopup(`<b>${clienteNombre}</b><br>Lat: ${latitud}<br>Lng: ${longitud}`)
            .openPopup();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
            }
        };
    }, [latitud, longitud, clienteNombre]);

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
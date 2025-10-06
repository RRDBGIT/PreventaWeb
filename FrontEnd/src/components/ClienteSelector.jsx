// C:\PreventaWeb\FrontEnd\src\components\clienteSelector.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para íconos en Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ClienteSelector = ({ cliente, setCliente, onClienteSeleccionado }) => {
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({
    razonSocial: '',
    direccion: '',
    telefono: '',
    idLocalidad: '',
    cuit: '',
    saldo: 0,
    latitud: null,
    longitud: null
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(false);
  const [localidades, setLocalidades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargandoGeolocalizacion, setCargandoGeolocalizacion] = useState(false);
  const [errorGeolocalizacion, setErrorGeolocalizacion] = useState('');
  const [clienteMapa, setClienteMapa] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Cargar clientes y localidades al cargar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [clientesRes, localidadesRes] = await Promise.all([
          API.get('/clientes'),
          API.get('/catalogos/localidades')
        ]);
        setClientes(clientesRes.data);
        setLocalidades(localidadesRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        alert("Error al cargar clientes o localidades. Verifique la conexión al servidor.");
      }
    };
    cargarDatos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Capturar geolocalización
  const capturarGeolocalizacion = () => {
    setCargandoGeolocalizacion(true);
    setErrorGeolocalizacion('');

    if (!navigator.geolocation) {
      setErrorGeolocalizacion("Geolocalización no soportada por este navegador.");
      setCargandoGeolocalizacion(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNuevoCliente(prev => ({
          ...prev,
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        }));
        setCargandoGeolocalizacion(false);
      },
      (error) => {
        console.error("Error al obtener geolocalización:", error);
        setErrorGeolocalizacion("No se pudo obtener la ubicación. Verifique los permisos.");
        setCargandoGeolocalizacion(false);
      }
    );
  };

  const handleCrearCliente = async () => {
    if (!nuevoCliente.razonSocial || !nuevoCliente.direccion || !nuevoCliente.idLocalidad || !nuevoCliente.cuit) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
        if (editando) {
        // ✅ Actualizar cliente existente
        console.log('Editando cliente con ID:', nuevoCliente.id_cliente);
        const clienteActualizado = await API.put(`/clientes/${nuevoCliente.id_cliente}`, {
          razon_social: nuevoCliente.razonSocial,
          direccion: nuevoCliente.direccion,
          telefono: nuevoCliente.telefono || null,
          id_localidad: nuevoCliente.idLocalidad || null,
          cuit: nuevoCliente.cuit,
          saldo: nuevoCliente.saldo,
          latitud: nuevoCliente.latitud,
          longitud: nuevoCliente.longitud
        });

        // 🔁 Recargar la lista de clientes para asegurar actualización visual
        const clientesRes = await API.get('/clientes');
        setClientes(clientesRes.data);

        setCliente(clienteActualizado.data);
        // ❌ No llamamos a onClienteSeleccionado aquí, para evitar cambio de pestaña
        alert("Cliente actualizado exitosamente.");
      } else {
        // ...
      }
  
     

      setMostrarFormulario(false);
      setEditando(false);
      setNuevoCliente({
        razonSocial: '',
        direccion: '',
        telefono: '',
        idLocalidad: '',
        cuit: '',
        saldo: 0,
        latitud: null,
        longitud: null
      });
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Error al guardar cliente. Verifique los datos.");
    }
  };

  const handleSeleccionarCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    if (onClienteSeleccionado) {
      onClienteSeleccionado(clienteSeleccionado); // ✅ Solo aquí se llama
    }
  };

    const iniciarEdicion = (cliente) => {
    console.log('Cliente recibido en iniciarEdicion:', cliente);

    // ✅ Buscar el ID de la localidad en la lista de localidades cargadas
    let idLocalidadCliente = '';
    if (cliente.localidad_nombre) {
      const localidadEncontrada = localidades.find(loc => loc.nombre === cliente.localidad_nombre);
      if (localidadEncontrada) {
        idLocalidadCliente = localidadEncontrada.id.toString();
      }
    }

    setNuevoCliente({
      id_cliente: cliente.IdCliente || cliente.id_cliente || cliente.id,
      razonSocial: cliente.razon_social,
      direccion: cliente.direccion,
      telefono: cliente.telefono || '',
      idLocalidad: idLocalidadCliente, // ← Usamos el ID encontrado
      cuit: cliente.cuit,
      saldo: cliente.saldo,
      latitud: cliente.latitud,
      longitud: cliente.longitud
    });
    setEditando(true);
    setMostrarFormulario(true);
  };
  
  // ✅ Función para ver en mapa
  const verEnMapa = (cliente) => {
    if (cliente.latitud && cliente.longitud) {
      setClienteMapa(cliente);
      setMostrarMapa(true);
    } else {
      alert('Este cliente no tiene geolocalización registrada.');
    }
  };

  const handleCancelarAlta = () => {
    setMostrarFormulario(false);
    setEditando(false);
    setNuevoCliente({
      razonSocial: '',
      direccion: '',
      telefono: '',
      idLocalidad: '',
      cuit: '',
      saldo: 0,
      latitud: null,
      longitud: null
    });
  };

  // Filtrar clientes según búsqueda
  const clientesFiltrados = clientes.filter(cliente => {
    const coincideNumero = cliente.numero_cliente?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRazon = cliente.razon_social?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideNumero || coincideRazon;
  });

  // ✅ Función para generar la URL de Google Maps con coordenadas
  const generarUrlGoogleMapsConCoordenadas = (latitud, longitud) => {
    if (latitud == null || longitud == null || isNaN(latitud) || isNaN(longitud)) {
      console.error("Coordenadas inválidas para generar la URL de Google Maps:", latitud, longitud);
      return null;
    }
    const lat = parseFloat(latitud).toFixed(6);
    const lng = parseFloat(longitud).toFixed(6);
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>👤 Seleccionar Cliente</h3>

      {/* Buscar cliente */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por número o razón social"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      {/* Lista de clientes */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '0.5rem', marginBottom: '1rem' }}>
        {clientesFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No hay clientes que coincidan con la búsqueda.</p>
        ) : (
          clientesFiltrados.map(c => (
            <div
              key={c.id_cliente} // ← El key sigue siendo el id del cliente
              style={{
                padding: '0.75rem',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: cliente?.id_cliente === c.id_cliente ? '#e9f7ef' : 'white',
                borderRadius: '4px',
                marginBottom: '4px'
              }}
              onClick={() => handleSeleccionarCliente(c)}
            >
              <div><strong>{c.numero_cliente}</strong></div>
              <div>{c.razon_social}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {c.direccion} - {c.localidad_nombre}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    iniciarEdicion(c);
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    verEnMapa(c);
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📍 Ver en mapa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón para crear cliente */}
      <button
        onClick={() => {
          setEditando(false);
          setMostrarFormulario(true);
        }}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        {editando ? '✏️ Editar Cliente' : '➕ Crear Cliente'}
      </button>

      {/* Formulario de alta o edición de cliente */}
      {mostrarFormulario && (
        <div style={{ marginTop: '1rem', border: '1px dashed #007bff', padding: '1rem', borderRadius: '8px' }}>
          <h4>{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Número de Cliente:</label>
              <input
                type="text"
                value={nuevoCliente.numero_cliente || "Se generará automáticamente"}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label>Razón Social:</label>
              <input
                type="text"
                name="razonSocial"
                value={nuevoCliente.razonSocial}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Dirección:</label>
              <input
                type="text"
                name="direccion"
                value={nuevoCliente.direccion}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={nuevoCliente.telefono}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Localidad:</label>
              <select
                name="idLocalidad"
                value={nuevoCliente.idLocalidad} // ✅ Aquí se carga la localidad actual del cliente en edición o creación
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Seleccionar localidad</option>
                {localidades.map(l => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label>CUIT:</label>
              <input
                type="text"
                name="cuit"
                value={nuevoCliente.cuit}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          {/* ✅ Botón para capturar geolocalización */}
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={capturarGeolocalizacion}
              disabled={cargandoGeolocalizacion}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: cargandoGeolocalizacion ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: cargandoGeolocalizacion ? 'not-allowed' : 'pointer',
                marginRight: '1rem'
              }}
            >
              {cargandoGeolocalizacion ? 'Obteniendo ubicación...' : '📍 Capturar Ubicación'}
            </button>
            {errorGeolocalizacion && (
              <span style={{ color: 'red', fontSize: '0.9rem' }}>
                {errorGeolocalizacion}
              </span>
            )}
            {nuevoCliente.latitud && nuevoCliente.longitud && (
              <span style={{ color: 'green', fontSize: '0.9rem', marginLeft: '1rem' }}>
                ✅ Ubicación capturada: {nuevoCliente.latitud.toFixed(4)}, {nuevoCliente.longitud.toFixed(4)}
              </span>
            )}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleCrearCliente}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {editando ? '💾 Guardar Cambios' : '✅ Crear Cliente'}
            </button>
            <button
              onClick={handleCancelarAlta}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal del mapa */}
      {mostrarMapa && clienteMapa && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '90%',
            height: '80%',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setMostrarMapa(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '0.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✕ Cerrar
            </button>
            <h3>Ubicación de: {clienteMapa.razon_social}</h3>
            <MapContainer
              center={[clienteMapa.latitud, clienteMapa.longitud]}
              zoom={15}
              style={{ height: '70%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[clienteMapa.latitud, clienteMapa.longitud]}>
                <Popup>
                  <b>{clienteMapa.razon_social}</b><br />
                  {clienteMapa.direccion}<br />
                  {/* ✅ Botón para abrir en Google Maps */}
                  <a
                    href={generarUrlGoogleMapsConCoordenadas(clienteMapa.latitud, clienteMapa.longitud)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      backgroundColor: '#4285f4',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    📍 Navegar (Mapa)
                  </a>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteSelector;
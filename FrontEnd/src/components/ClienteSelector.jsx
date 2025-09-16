import React, { useState, useEffect } from 'react';
import API from '../services/api';

const ClienteSelector = ({ cliente, setCliente, onClienteSeleccionado }) => {
    const [clientes, setClientes] = useState([]);
    const [nuevoCliente, setNuevoCliente] = useState({
        razonSocial: '',
        direccion: '',
        telefono: '',
        idLocalidad: '',
        cuit: '',
        saldo: 0
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [localidades, setLocalidades] = useState([]);
    const [busqueda, setBusqueda] = useState('');

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

    // Generar número de cliente automático
    const generarNumeroCliente = () => {
        if (clientes.length === 0) {
            return 'CL001';
        }

        const ultimoCliente = clientes.reduce((prev, curr) => {
            const numPrev = parseInt(prev.numero_cliente?.replace('CL', '') || 0, 10);
            const numCurr = parseInt(curr.numero_cliente?.replace('CL', '') || 0, 10);
            return numCurr > numPrev ? curr : prev;
        });

        const num = parseInt(ultimoCliente.numero_cliente?.replace('CL', '') || 0, 10) + 1;
        return `CL${num.toString().padStart(3, '0')}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoCliente(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCrearCliente = async () => {
        if (!nuevoCliente.razonSocial || !nuevoCliente.direccion || !nuevoCliente.idLocalidad || !nuevoCliente.cuit) {
            alert("Por favor complete todos los campos obligatorios.");
            return;
        }

        try {
            const clienteCreado = await API.post('/clientes', {
                numero_cliente: generarNumeroCliente(),
                razon_social: nuevoCliente.razonSocial,
                direccion: nuevoCliente.direccion,
                telefono: nuevoCliente.telefono,
                id_localidad: nuevoCliente.idLocalidad,
                cuit: nuevoCliente.cuit,
                saldo: 0
            });

            // Actualizar lista de clientes
            setClientes(prev => [...prev, clienteCreado.data]);
            // Seleccionar el cliente recién creado
            setCliente(clienteCreado.data);
            // ✅ ¡AVANZAR AL SIGUIENTE PASO!
            if (onClienteSeleccionado) {
                onClienteSeleccionado(clienteCreado.data);
            }
            // Ocultar formulario
            setMostrarFormulario(false);
            // Resetear formulario
            setNuevoCliente({
                razonSocial: '',
                direccion: '',
                telefono: '',
                idLocalidad: '',
                cuit: '',
                saldo: 0
            });
        } catch (error) {
            console.error("Error al crear cliente:", error);
            alert("Error al crear cliente. Verifique los datos.");
        }
    };

    const handleSeleccionarCliente = (clienteSeleccionado) => {
        setCliente(clienteSeleccionado);
        // ✅ ¡AVANZAR AL SIGUIENTE PASO!
        if (onClienteSeleccionado) {
            onClienteSeleccionado(clienteSeleccionado);
        }
    };

    const handleCancelarAlta = () => {
        setMostrarFormulario(false);
        setNuevoCliente({
            razonSocial: '',
            direccion: '',
            telefono: '',
            idLocalidad: '',
            cuit: '',
            saldo: 0
        });
    };

    // Filtrar clientes según búsqueda
    const clientesFiltrados = clientes.filter(cliente => {
        const coincideNumero = cliente.numero_cliente?.toLowerCase().includes(busqueda.toLowerCase());
        const coincideRazon = cliente.razon_social?.toLowerCase().includes(busqueda.toLowerCase());
        return coincideNumero || coincideRazon;
    });

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
                            key={c.id_cliente}
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
                        </div>
                    ))
                )}
            </div>

            {/* Botón para crear cliente */}
            <button
                onClick={() => setMostrarFormulario(true)}
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
                ➕ Crear Cliente
            </button>

            {/* Formulario de alta de cliente */}
            {mostrarFormulario && (
                <div style={{ marginTop: '1rem', border: '1px dashed #007bff', padding: '1rem', borderRadius: '8px' }}>
                    <h4>Nuevo Cliente</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label>Número de Cliente:</label>
                            <input
                                type="text"
                                value={generarNumeroCliente()}
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
                                value={nuevoCliente.idLocalidad}
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
                            ✅ Crear Cliente
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
        </div>
    );
};

export default ClienteSelector;
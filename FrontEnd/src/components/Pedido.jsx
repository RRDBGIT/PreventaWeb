// C:\PreventaWeb\FrontEnd\src\components\Pedido.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Carrito from './Carrito';
import BusquedaPorCodigo from './BusquedaPorCodigo';
import ProductoSelector from './ProductoSelector';
import ConfirmacionPedido from './ConfirmacionPedido';
import ClienteSelector from './ClienteSelector';
import ResumenPedidosDia from './ResumenPedidosDia';
import { logout, getUsuario } from '../utils/auth';
import ResumenCierreModal from './ResumenCierreModal';
import '../Index.css';

const Pedido = () => {
    const navigate = useNavigate();
    const [paso, setPaso] = useState('cliente');
    const [cliente, setCliente] = useState(null);
    const [carrito, setCarrito] = useState([]);
    const [modoCarga, setModoCarga] = useState(null);
    const [listaPrecios, setListaPrecios] = useState('');
    const [listaPreciosBloqueada, setListaPreciosBloqueada] = useState(false);
    const [formasPago, setFormasPago] = useState([]);
    const [formaPago, setFormaPago] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [guardandoPedido, setGuardandoPedido] = useState(false);
    const [numeroPedidoCreado, setNumeroPedidoCreado] = useState(null);
    const [pedidoCreado, setPedidoCreado] = useState(null);
    const [mostrarPDF, setMostrarPDF] = useState(false);
    const [mostrarResumenCierre, setMostrarResumenCierre] = useState(false);
    const [nombreVendedor, setNombreVendedor] = useState('');
    const [mostrarResumen, setMostrarResumen] = useState(false); // ✅ Nuevo estado para resumen

    // ✅ Función para establecer valores por defecto
    const establecerValoresPorDefecto = () => {
        // Fecha de vencimiento: hoy + 2 días
        const hoy = new Date();
        const dosDiasDespues = new Date(hoy);
        dosDiasDespues.setDate(dosDiasDespues.getDate() + 2);
        const fechaFormateada = dosDiasDespues.toISOString().split('T')[0];
        setFechaVencimiento(fechaFormateada);

        // Forma de pago predefinida
        const predefinida = formasPago.find(fp => fp.predefinido === 1);
        if (predefinida) {
            setFormaPago(String(predefinida.id));
        } else {
            setFormaPago('');
        }
    };

    useEffect(() => {
        const usuario = getUsuario();
        if (usuario) {
            const nombre = usuario.nombre || 'Vendedor';
            setNombreVendedor(nombre);
        }
    }, []);

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [fpRes, lpRes] = await Promise.all([
                    API.get('/catalogos/formas-pago'),
                    API.get('/catalogos/listas-precios')
                ]);
                setFormasPago(fpRes.data);
            } catch (error) {
                console.error("Error al cargar catálogos", error);
            }
        };

        cargarCatalogos();
    }, []);

    // ✅ Aplicar valores por defecto cuando formasPago esté cargado
    useEffect(() => {
        if (formasPago.length > 0) {
            establecerValoresPorDefecto();
        }
    }, [formasPago]);

    const agregarAlCarrito = (producto, cantidad, precio) => {
        if (carrito.length === 0 && !listaPreciosBloqueada) {
            setListaPreciosBloqueada(true);
        }

        const nuevoItem = {
            id: Date.now(),
            producto,
            cantidad,
            precioUnitario: precio,
            importe: cantidad * precio,
            idListaPrecios: listaPrecios || null
        };
        setCarrito(prev => [...prev, nuevoItem]);
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    const vaciarCarrito = () => {
        if (window.confirm("¿Está seguro de que desea vaciar el carrito?")) {
            setCarrito([]);
            setListaPreciosBloqueada(false);
        }
    };

    const total = carrito.reduce((sum, item) => sum + item.importe, 0);

    const siguiente = () => {
        if (paso === 'cliente' && !cliente) {
            alert('Debe seleccionar un cliente');
            return;
        }
        if (paso === 'pedido' && carrito.length === 0) {
            alert('Debe agregar al menos un producto');
            return;
        }
        setPaso(paso === 'cliente' ? 'pedido' : 'confirmacion');
    };

    const anterior = () => {
        setPaso(paso === 'confirmacion' ? 'pedido' : 'cliente');
    };

    const confirmarPedido = async (datosConfirmacion) => {
        const usuario = getUsuario();
        const idVendedor = usuario?.id;

        setGuardandoPedido(true);
        setNumeroPedidoCreado(null);
        setMostrarPDF(false);
        setPedidoCreado(null);

        try {
            // ✅ Extraer fechaEntrega de los datos de confirmación
            const { fechaEntrega } = datosConfirmacion;

            const response = await API.post('/pedidos', {
                idCliente: cliente.id_cliente,
                fechaVencimiento,
                idFormaPago: formaPago,
                idListaPrecios: listaPrecios,
                total,
                carrito,
                idVendedor,
                fechaEntrega // ✅ ¡Ahora se envía!
            });

            const pedidoCreado = response.data;
            setNumeroPedidoCreado(pedidoCreado.numero_pedido);
            setPedidoCreado(pedidoCreado);
            setMostrarPDF(true);

            console.log("✅ Pedido creado con éxito:", pedidoCreado.numero_pedido);

        } catch (error) {
            console.error("❌ ERROR al crear pedido:", error);
            alert("Error al crear el pedido. Por favor, inténtelo de nuevo.");
        } finally {
            setGuardandoPedido(false);
        }
    };

    // ✅ Reiniciar flujo Y restablecer valores por defecto
    const reiniciarFlujo = () => {
        setMostrarPDF(false);
        setNumeroPedidoCreado(null);
        setPedidoCreado(null);
        setPaso('cliente');
        setCliente(null);
        setCarrito([]);
        setModoCarga(null);
        setListaPrecios('');
        setListaPreciosBloqueada(false);
        // ✅ No resetear formaPago ni fecha aquí, porque se restablecerán en establecerValoresPorDefecto
        establecerValoresPorDefecto(); // ✅ ¡Clave!
    };

    const handleClienteSeleccionado = (clienteSeleccionado) => {
        setCliente(clienteSeleccionado);
        setPaso('pedido');
    };

    const handleLogout = () => {
        logout(navigate);
    };

    const handleAbrirResumenCierre = () => {
        setMostrarResumenCierre(true);
    };

    const handleConfirmarCierre = async () => {
        try {
            const usuario = getUsuario();
            const idVendedor = usuario?.id;

            if (!idVendedor) {
                throw new Error('No se encontró el ID del vendedor. Por favor, inicie sesión nuevamente.');
            }

            const response = await API.post('/pedidos/cerrar-dia', {
                idVendedor
            });

            const data = response.data;
            if (data.success) {
                alert(`✅ ${data.message}`);
                logout(navigate);
            } else {
                throw new Error(data.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error al cerrar día:', error);
            const mensaje = error.response?.data?.error || error.message || 'Error al cerrar el día';
            alert(`❌ ${mensaje}`);
        }
    };

    // ✅ Handler para abrir/cerrar resumen de pedidos
    const handleAbrirResumen = () => {
        setMostrarResumen(true);
    };

    const handleVolverDesdeResumen = () => {
        setMostrarResumen(false);
    };

    return (
        <div className="layout-pedido" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Arial', backgroundColor: '#f8f9fa' }}>
            {/* ✅ Header con botón de Resumen agregado */}
            <div style={{ 
                padding: '1rem', 
                backgroundColor: 'white', 
                borderBottom: '2px solid #007bff', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                    Panel de Pedidos - <span style={{ color: '#28a745' }}>{nombreVendedor}</span>
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* ✅ NUEVO: Botón Resumen */}
                    <button 
                        onClick={handleAbrirResumen}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#17a2b8', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}
                    >
                        📊 Resumen
                    </button>
                    <button 
                        onClick={handleAbrirResumenCierre}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}
                    >
                        📅 Cerrar Día
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer' 
                        }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* ✅ Renderizado condicional: Resumen o Flujo Normal */}
            {mostrarResumen ? (
                // ✅ Vista de Resumen de Pedidos del Día
                <ResumenPedidosDia onVolver={handleVolverDesdeResumen} />
            ) : (
                // ✅ Flujo normal de creación de pedidos
                <div className="panel-formulario" style={{ flex: 1, display: 'flex', overflowY: 'auto' }}>
                    <div className="panel-formulario-content" style={{ flex: 2, padding: '2rem', backgroundColor: 'white', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', borderBottom: '2px solid #007bff', marginBottom: '1rem' }}>
                            <button
                                onClick={() => setPaso('cliente')}
                                style={{
                                    padding: '1rem',
                                    backgroundColor: paso === 'cliente' ? '#007bff' : '#e9ecef',
                                    color: paso === 'cliente' ? 'white' : 'black',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: paso === 'cliente' ? 'bold' : 'normal'
                                }}
                            >
                                👤 Cliente
                            </button>
                            <button
                                onClick={() => setPaso('pedido')}
                                disabled={!cliente}
                                style={{
                                    padding: '1rem',
                                    backgroundColor: paso === 'pedido' ? '#007bff' : '#e9ecef',
                                    color: paso === 'pedido' ? 'white' : 'black',
                                    border: 'none',
                                    cursor: cliente ? 'pointer' : 'not-allowed',
                                    fontWeight: paso === 'pedido' ? 'bold' : 'normal',
                                    opacity: cliente ? 1 : 0.5
                                }}
                            >
                                🛒 Pedido
                            </button>
                            <button
                                onClick={() => setPaso('confirmacion')}
                                disabled={carrito.length === 0}
                                style={{
                                    padding: '1rem',
                                    backgroundColor: paso === 'confirmacion' ? '#007bff' : '#e9ecef',
                                    color: paso === 'confirmacion' ? 'white' : 'black',
                                    border: 'none',
                                    cursor: carrito.length > 0 ? 'pointer' : 'not-allowed',
                                    fontWeight: paso === 'confirmacion' ? 'bold' : 'normal',
                                    opacity: carrito.length > 0 ? 1 : 0.5
                                }}
                            >
                                📄 Confirmación
                            </button>
                        </div>

                        {paso === 'cliente' && (
                            <ClienteSelector 
                                cliente={cliente} 
                                setCliente={setCliente} 
                                onClienteSeleccionado={handleClienteSeleccionado}
                            />
                        )}

                        {paso === 'pedido' && (
                            <div>
                                {cliente && (
                                    <div style={{ 
                                        backgroundColor: '#e9f7ef', 
                                        padding: '1rem', 
                                        borderRadius: '8px', 
                                        marginBottom: '1rem',
                                        borderLeft: '4px solid #28a745'
                                    }}>
                                        <h4>👤 Cliente Seleccionado</h4>
                                        <p><strong>{cliente.razon_social}</strong></p>
                                        <p>{cliente.direccion} - {cliente.localidad_nombre}</p>
                                        <p><strong>CUIT:</strong> {cliente.cuit}</p>
                                    </div>
                                )}

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>📅 Fecha de Vencimiento: </label>
                                    <input
                                        type="date"
                                        value={fechaVencimiento}
                                        onChange={(e) => setFechaVencimiento(e.target.value)}
                                        required
                                        style={{ marginLeft: '1rem', padding: '0.3rem' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>💳 Forma de Pago: </label>
                                    <select
                                        value={formaPago}
                                        onChange={(e) => setFormaPago(e.target.value)}
                                        style={{ marginLeft: '1rem', padding: '0.3rem' }}
                                    >
                                        <option value="">Seleccionar</option>
                                       {formasPago.map(fp => (<option key={fp.id} value={String(fp.id)}>{fp.descripcion}</option>))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label>🏷️ Lista de Precios: </label>
                                    <select
                                        value={listaPrecios}
                                        onChange={(e) => setListaPrecios(e.target.value)}
                                        disabled={listaPreciosBloqueada}
                                        style={{ marginLeft: '1rem', padding: '0.3rem' }}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="1">Lista 1</option>
                                        <option value="2">Lista 2</option>
                                        <option value="3">Lista 3</option>
                                        <option value="4">Lista 4</option>
                                        <option value="5">Lista 5</option>
                                        <option value="6">Lista 6</option>
                                        <option value="7">Lista 7</option>
                                        <option value="8">Lista 8</option>
                                        <option value="9">Lista 9</option>
                                    </select>
                                    {listaPreciosBloqueada && (
                                        <span style={{ marginLeft: '0.5rem', color: '#28a745', fontWeight: 'bold' }}>
                                            ✔ Fijada
                                        </span>
                                    )}
                                </div>

                                {!modoCarga && (
                                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                        <button
                                            onClick={() => setModoCarga('codigo')}
                                            style={{ padding: '1rem 2rem', fontSize: '1.2rem', margin: '0.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px' }}
                                        >
                                            🔢 Cargar por Código
                                        </button>
                                        <button
                                            onClick={() => setModoCarga('catalogo')}
                                            style={{ padding: '1rem 2rem', fontSize: '1.2rem', margin: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px' }}
                                        >
                                            📚 Cargar por Catálogo
                                        </button>
                                    </div>
                                )}

                                {modoCarga === 'codigo' && listaPrecios && (
                                    <BusquedaPorCodigo listaPreciosId={listaPrecios} onAdd={agregarAlCarrito} />
                                )}

                                {modoCarga === 'catalogo' && listaPrecios && (
                                    <ProductoSelector listaPreciosId={listaPrecios} onAdd={agregarAlCarrito} />
                                )}

                                {modoCarga && (
                                    <button
                                        onClick={() => setModoCarga(null)}
                                        style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        ← Cambiar modo de carga
                                    </button>
                                )}
                            </div>
                        )}

                        {paso === 'confirmacion' && (
                            <ConfirmacionPedido
                                carrito={carrito}
                                total={total}
                                cliente={cliente}
                                fechaVencimiento={fechaVencimiento}
                                formaPago={formasPago.find(fp => String(fp.id) === formaPago)?.descripcion || ''}
                                onConfirmar={confirmarPedido}
                                guardando={guardandoPedido}
                                numeroPedido={numeroPedidoCreado}
                                mostrarPDF={mostrarPDF}
                                onCerrarPDF={reiniciarFlujo}
                                pedidoCreado={pedidoCreado}
                            />
                        )}

                        <div className="nav-buttons" style={{ marginTop: '2rem', textAlign: 'right', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {paso !== 'cliente' && (
                                <button
                                    onClick={anterior}
                                    className="boton-responsive"
                                    style={{ padding: '0.7rem 2rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', marginRight: '1rem' }}
                                >
                                    ← Anterior
                                </button>
                            )}
                            {paso !== 'confirmacion' && (
                                <button
                                    onClick={siguiente}
                                    className="boton-responsive"
                                    style={{ padding: '0.7rem 2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                                >
                                    Siguiente →
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="panel-carrito" style={{ flex: 1, backgroundColor: 'white', borderLeft: '1px solid #ddd', padding: '1rem', overflowY: 'auto' }}>
                        <h3 style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>🛒 Carrito</h3>
                        <Carrito items={carrito} onRemove={eliminarDelCarrito} total={total} />
                        {carrito.length > 0 && paso !== 'confirmacion' && (
                            <>
                                <button
                                    onClick={vaciarCarrito}
                                    className="boton-responsive"
                                    style={{
                                        padding: '0.7rem 2rem',
                                        fontSize: '1.1rem',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '1rem',
                                        width: '100%'
                                    }}
                                >
                                    🗑️ Vaciar Carrito
                                </button>
                                <button
                                    onClick={() => setPaso('confirmacion')}
                                    className="boton-responsive"
                                    style={{
                                        padding: '0.7rem 2rem',
                                        fontSize: '1.1rem',
                                        backgroundColor: '#ffc107',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '1rem',
                                        width: '100%'
                                    }}
                                >
                                    📄 Ver Contenido / Confirmar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <ResumenCierreModal
                isOpen={mostrarResumenCierre}
                onClose={() => setMostrarResumenCierre(false)}
                onConfirmarCierre={handleConfirmarCierre}
            />
        </div>
    );
};

export default Pedido;
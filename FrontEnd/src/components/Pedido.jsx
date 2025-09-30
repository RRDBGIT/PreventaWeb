// FrontEnd/src/components/Pedido.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import API from '../services/api';
import Carrito from './Carrito';
import BusquedaPorCodigo from './BusquedaPorCodigo';
import ProductoSelector from './ProductoSelector';
import ConfirmacionPedido from './ConfirmacionPedido';
import ClienteSelector from './ClienteSelector';
import { logout } from '../utils/auth'; // Importa la función de logout
import '../Index.css'; // ✅ Importar estilos globales

const Pedido = () => {
    const navigate = useNavigate(); // Hook para navegar
    const [paso, setPaso] = useState('cliente'); // 'cliente', 'pedido', 'confirmacion'
    const [cliente, setCliente] = useState(null);
    const [carrito, setCarrito] = useState([]);
    const [modoCarga, setModoCarga] = useState(null); // null, 'codigo', 'catalogo'
    const [listaPrecios, setListaPrecios] = useState('');
    const [formasPago, setFormasPago] = useState([]);
    const [formaPago, setFormaPago] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    // ✅ Estados adicionales para manejar la creación del pedido
    const [guardandoPedido, setGuardandoPedido] = useState(false);
    const [numeroPedidoCreado, setNumeroPedidoCreado] = useState(null);
    const [pedidoCreado, setPedidoCreado] = useState(null); // ✅ Nuevo estado para el pedido completo
    const [mostrarPDF, setMostrarPDF] = useState(false);

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

    const agregarAlCarrito = (producto, cantidad, precio) => {
        const nuevoItem = {
            id: Date.now(),
            producto,
            cantidad,
            precioUnitario: precio,
            importe: cantidad * precio
        };
        setCarrito(prev => [...prev, nuevoItem]);
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    // ✅ Función para vaciar el carrito
    const vaciarCarrito = () => {
        if (window.confirm("¿Está seguro de que desea vaciar el carrito?")) {
            setCarrito([]);
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

    // ✅ Función corregida para crear el pedido en el backend
    const confirmarPedido = async (datosConfirmacion) => {
        // Extraer datos del formulario de confirmación
        // const { fechaEntrega, ordenCompra, observaciones, emailOpcional } = datosConfirmacion; // Puedes usarlos si el backend los necesita

        // Obtener ID del vendedor del localStorage (simulando autenticación)
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const idVendedor = usuario?.id;

        setGuardandoPedido(true);
        setNumeroPedidoCreado(null);
        setMostrarPDF(false);
        setPedidoCreado(null); // ✅ Resetear pedido anterior

        try {
            const response = await API.post('/pedidos', {
                idCliente: cliente.id_cliente,
                fechaVencimiento,
                idFormaPago: formaPago,
                idListaPrecios: listaPrecios,
                total,
                carrito,
                idVendedor, // ✅ Enviar ID del vendedor
                // Puedes enviar también fechaEntrega, ordenCompra, observaciones, emailOpcional si el backend los necesita
            });

            const pedidoCreado = response.data;
            setNumeroPedidoCreado(pedidoCreado.numero_pedido);
            setPedidoCreado(pedidoCreado); // ✅ Guardar el pedido completo
            setMostrarPDF(true); // ✅ Activar visualización del PDF

            console.log("✅ Pedido creado con éxito:", pedidoCreado.numero_pedido);

        } catch (error) {
            console.error("❌ ERROR al crear pedido:", error);
            alert("Error al crear el pedido. Por favor, inténtelo de nuevo.");
        } finally {
            setGuardandoPedido(false);
        }
    };

    // ✅ Función para reiniciar el flujo después de crear el pedido
    const reiniciarFlujo = () => {
        setMostrarPDF(false);
        setNumeroPedidoCreado(null);
        setPedidoCreado(null); // ✅ Resetear pedido
        setPaso('cliente');
        setCliente(null);
        setCarrito([]);
        setModoCarga(null);
        setListaPrecios('');
        setFormaPago('');
        setFechaVencimiento('');
    };

    // ✅ Función para manejar la selección de cliente
    const handleClienteSeleccionado = (clienteSeleccionado) => {
        setCliente(clienteSeleccionado);
        // ✅ Pasar automáticamente a la pestaña de pedidos
        setPaso('pedido');
    };

    // ✅ Función para manejar el logout
    const handleLogout = () => {
        logout(navigate); // Llama a la función logout pasando navigate
    };

    return (
        <div className="layout-pedido" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Arial', backgroundColor: '#f8f9fa' }}>
            {/* Panel superior: Encabezado con título y botón de Cerrar Sesión */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '2px solid #007bff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Panel de Pedidos</h2>
                <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Cerrar Sesión
                </button>
            </div>

            {/* Panel central: Formulario con tabs */}
            <div className="panel-formulario" style={{ flex: 1, display: 'flex', overflowY: 'auto' }}>
                {/* Panel izquierdo: Formulario */}
                <div className="panel-formulario-content" style={{ flex: 2, padding: '2rem', backgroundColor: 'white', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
                    {/* Tabs */}
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

                    {/* Paso Cliente */}
                    {paso === 'cliente' && (
                        <ClienteSelector 
                            cliente={cliente} 
                            setCliente={setCliente} 
                            onClienteSeleccionado={handleClienteSeleccionado} // ✅ Pasar la función corregida
                        />
                    )}

                    {/* Paso Pedido */}
                    {paso === 'pedido' && (
                        <div>
                            {/* ✅ Label con la descripción del cliente */}
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
                                   {formasPago.map(fp => (<option key={fp.id} value={fp.id}>{fp.descripcion}</option>))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>🏷️ Lista de Precios: </label>
                                <select
                                    value={listaPrecios}
                                    onChange={(e) => setListaPrecios(e.target.value)}
                                    style={{ marginLeft: '1rem', padding: '0.3rem' }}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="1">Lista 1 - Minoristas</option>
                                    <option value="2">Lista 2 - Mayoristas</option>
                                    <option value="3">Lista 3 - Especiales</option>
                                </select>
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

                    {/* Paso Confirmación */}
                    {paso === 'confirmacion' && (
                        <ConfirmacionPedido
                            carrito={carrito}
                            total={total}
                            cliente={cliente}
                            fechaVencimiento={fechaVencimiento}
                            formaPago={formasPago.find(fp => fp.IdPago == formaPago)?.Descripcion || ''}
                            onConfirmar={confirmarPedido} // ✅ Pasar la función corregida
                            guardando={guardandoPedido} // ✅ Pasar estado de carga
                            numeroPedido={numeroPedidoCreado} // ✅ Pasar número de pedido creado
                            mostrarPDF={mostrarPDF} // ✅ Pasar estado para mostrar PDF
                            onCerrarPDF={reiniciarFlujo} // ✅ Pasar función para cerrar PDF y reiniciar
                            pedidoCreado={pedidoCreado} // ✅ Pasar el pedido creado completo
                        />
                    )}

                    {/* Botones de navegación */}
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

                {/* Panel derecho: Carrito fijo */}
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
        </div>
    );
};

export default Pedido;
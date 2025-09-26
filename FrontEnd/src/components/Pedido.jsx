import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Carrito from './Carrito';
import BusquedaPorCodigo from './BusquedaPorCodigo';
import ProductoSelector from './ProductoSelector';
import ConfirmacionPedido from './ConfirmacionPedido';
import ClienteSelector from './ClienteSelector';

const Pedido = () => {
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
    // const [numeroPedidoCreado, setNumeroPedidoCreado] = useState(null); // ❌ Ya no se usa directamente
    const [pedidoCreado, setPedidoCreado] = useState(null); // ✅ Nuevo estado para el pedido completo
    // const [mostrarPDF, setMostrarPDF] = useState(false); // ❌ Ya no se usa directamente

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
        // setNumeroPedidoCreado(null); // ❌ Ya no se usa
        // setMostrarPDF(false); // ❌ Ya no se usa
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
            // setNumeroPedidoCreado(pedidoCreado.numero_pedido); // ❌ Ya no se usa
            // setMostrarPDF(true); // ❌ Ya no se usa
            setPedidoCreado(pedidoCreado); // ✅ Guardar el pedido completo

            console.log("✅ Pedido creado con éxito:", pedidoCreado.numero_pedido);

        } catch (error) {
            console.error("❌ Error al crear pedido:", error);
            alert("Error al crear el pedido. Por favor, inténtelo de nuevo.");
        } finally {
            setGuardandoPedido(false);
        }
    };

    // ✅ Función para reiniciar el flujo después de crear el pedido
    const reiniciarFlujo = () => {
        // setMostrarPDF(false); // ❌ Ya no se usa
        // setNumeroPedidoCreado(null); // ❌ Ya no se usa
        setPedidoCreado(null); // ✅ Resetear pedido
        setPaso('cliente');
        setCliente(null);
        setCarrito([]);
        setModoCarga(null);
        setListaPrecios('');
        setFormaPago('');
        setFechaVencimiento('');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
            {/* Panel izquierdo: Formulario con tabs */}
            <div style={{ flex: 2, padding: '2rem', backgroundColor: '#f8f9fa' }}>
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
                {paso === 'cliente' && <ClienteSelector cliente={cliente} setCliente={setCliente} />}

                {/* Paso Pedido */}
                {paso === 'pedido' && (
                    <div>
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
                        // carrito={carrito}
                        // total={total}
                        // cliente={cliente}
                        // fechaVencimiento={fechaVencimiento}
                        // formaPago={formasPago.find(fp => fp.IdPago == formaPago)?.Descripcion || ''} // ❌ Ya no se pasa así
                        onConfirmar={confirmarPedido} // ✅ Pasar la función corregida
                        guardando={guardandoPedido} // ✅ Pasar estado de carga
                        // numeroPedido={numeroPedidoCreado} // ❌ Ya no se pasa así
                        // mostrarPDF={mostrarPDF} // ❌ Ya no se pasa así
                        // onCerrarPDF={reiniciarFlujo} // ❌ Ya no se pasa así
                        pedidoCreado={pedidoCreado} // ✅ Pasar el pedido creado completo
                    />
                )}

                {/* Botones de navegación */}
                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    {paso !== 'cliente' && (
                        <button
                            onClick={anterior}
                            style={{ padding: '0.7rem 2rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', marginRight: '1rem' }}
                        >
                            ← Anterior
                        </button>
                    )}
                    {paso !== 'confirmacion' && (
                        <button
                            onClick={siguiente}
                            style={{ padding: '0.7rem 2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                            Siguiente →
                        </button>
                    )}
                </div>
            </div>

            {/* Panel derecho: Carrito fijo */}
            <div style={{ flex: 1, backgroundColor: 'white', borderLeft: '1px solid #ddd', padding: '1rem' }}>
                <h3 style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>🛒 Carrito</h3>
                <Carrito items={carrito} onRemove={eliminarDelCarrito} total={total} />
                {carrito.length > 0 && paso !== 'confirmacion' && (
                    <button
                        onClick={() => setPaso('confirmacion')}
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
                )}
            </div>
        </div>
    );
};

export default Pedido;
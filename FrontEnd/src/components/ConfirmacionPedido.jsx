// FrontEnd/src/components/ConfirmacionPedido.jsx
import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ReportePedidoPDF from './ReportePedidoPDF';
import '../Index.css'; // ✅ Importar estilos globales

const ConfirmacionPedido = ({ 
    carrito, 
    total, 
    cliente, 
    fechaVencimiento, 
    formaPago, 
    onConfirmar,
    guardando,
    numeroPedido,
    mostrarPDF,
    onCerrarPDF,
    pedidoCreado // ✅ Recibir el pedido completo
}) => {
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [ordenCompra, setOrdenCompra] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [emailOpcional, setEmailOpcional] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fechaEntrega) {
            alert("Seleccione fecha de entrega");
            return;
        }
        // ✅ Pasar los datos del formulario a la función onConfirmar
        const datosConfirmacion = {
            fechaEntrega,
            ordenCompra,
            observaciones,
            emailOpcional
        };
        onConfirmar(datosConfirmacion);
    };

    // ✅ Si se recibió un pedido creado, mostrar el PDF
    if (mostrarPDF && pedidoCreado) {
        // Crear el objeto datosParaPDF con la estructura esperada por ReportePedidoPDF
        const datosParaPDF = {
            numeroPedido: pedidoCreado.numero_pedido,
            cliente: {
                razon_social: pedidoCreado.razon_social_cliente,
                // Puedes agregar más datos del cliente aquí si los necesita el PDF
                // direccion: pedidoCreado.direccion_cliente, // Si el backend los devolviera
                // localidad_nombre: pedidoCreado.localidad_nombre, // Si el backend los devolviera
                // cuit: pedidoCreado.cuit_cliente, // Si el backend los devolviera
            },
            fechaVencimiento: pedidoCreado.fecha_vencimiento,
            formaPago: pedidoCreado.forma_pago, // ✅ Del JOIN con FormasDePago
            listaPrecios: pedidoCreado.lista_precios, // ✅ Del JOIN con ListasDePrecios
            carrito: pedidoCreado.carrito_items || carrito, // Asegúrate de que el backend lo envíe o pásalo desde Pedido.jsx
            total: pedidoCreado.total,
	    vendedor: pedidoCreado.nombre_vendedor // ✅ Pasar el nombre del vendedor
            // Puedes agregar más datos aquí si los necesitas en el PDF
        };

        return (
            <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2>📄 Pedido Confirmado</h2>
                    <div>
                        <PDFDownloadLink
                            document={<ReportePedidoPDF pedido={datosParaPDF} />}
                            fileName={`pedido_${pedidoCreado.numero_pedido}.pdf`}
                        >
                            {({ loading }) =>
                                loading ? (
                                    <button style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107' }}>
                                        Generando PDF...
                                    </button>
                                ) : (
                                    <button
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        💾 Descargar PDF
                                    </button>
                                )
                            }
                        </PDFDownloadLink>
                        <button
                            onClick={onCerrarPDF}
                            style={{
                                marginLeft: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            ← Nuevo Pedido
                        </button>
                    </div>
                </div>
                <div style={{ height: 'calc(100vh - 150px)', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <PDFViewer width="100%" height="100%">
                        <ReportePedidoPDF pedido={datosParaPDF} />
                    </PDFViewer>
                </div>
            </div>
        );
    }

    // ✅ Si se está guardando, mostrar un mensaje
    if (guardando) {
        return (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
                <h2>⏳ Guardando Pedido...</h2>
                <p>Por favor, espere mientras se procesa su solicitud.</p>
            </div>
        );
    }

    // ✅ Si llega aquí, es porque aún no se ha confirmado el pedido.
    // Mostrar el formulario de confirmación.
    return (
        <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📄 Confirmación de Pedido</h2>

            {/* Aquí puedes mostrar un resumen básico si lo deseas, o dejar solo el formulario */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p><strong>Cliente:</strong> {cliente?.razon_social}</p>
                <p>{cliente?.direccion} - {cliente?.localidad_nombre}</p>
                <p><strong>CUIT:</strong> {cliente?.cuit}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>📅 Fecha de Entrega:</label>
                    <input
                        type="date"
                        value={fechaEntrega}
                        onChange={(e) => setFechaEntrega(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>🔢 Orden de Compra (opcional):</label>
                    <input
                        type="text"
                        value={ordenCompra}
                        onChange={(e) => setOrdenCompra(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>📝 Observaciones:</label>
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows="3"
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>✉️ Email Opcional (para confirmación):</label>
                    <input
                        type="email"
                        value={emailOpcional}
                        onChange={(e) => setEmailOpcional(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
                    />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="submit"
                        disabled={guardando}
                        style={{
                            padding: '0.7rem 2rem',
                            fontSize: '1.1rem',
                            backgroundColor: guardando ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: guardando ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {guardando ? 'Guardando pedido...' : '✅ Confirmar Pedido'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfirmacionPedido;
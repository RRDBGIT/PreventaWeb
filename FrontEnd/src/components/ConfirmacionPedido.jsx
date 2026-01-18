// FrontEnd/src/components/ConfirmacionPedido.jsx

import React, { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ReportePedidoPDF from './ReportePedidoPDF';
import '../Index.css';

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
    pedidoCreado
}) => {
    const [fechaEntrega, setFechaEntrega] = useState('');

    // ✅ Establecer fecha de entrega por defecto: hoy + 1 día
    useEffect(() => {
        const hoy = new Date();
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const fechaFormateada = manana.toISOString().split('T')[0]; // ✅ Corregido: solo un punto
        setFechaEntrega(fechaFormateada);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fechaEntrega) {
            alert("Seleccione fecha de entrega");
            return;
        }
        const datosConfirmacion = {
            fechaEntrega
        };
        onConfirmar(datosConfirmacion);
    };

    if (mostrarPDF && pedidoCreado) {
        const datosParaPDF = {
            numeroPedido: pedidoCreado.numero_pedido,
            cliente: {
                razon_social: pedidoCreado.razon_social_cliente,
            },
            fechaVencimiento: pedidoCreado.fecha_vencimiento,
            formaPago: pedidoCreado.forma_pago,
            listaPrecios: pedidoCreado.lista_precios,
            carrito: pedidoCreado.carrito_items || carrito,
            total: pedidoCreado.total,
            vendedor: pedidoCreado.nombre_vendedor
        };

        return (
            <div style={{ padding: '1rem' }}>
                <div className="pdf-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2>📄 Pedido Confirmado</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                                        className="boton-responsive"
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
                            className="boton-responsive"
                            style={{
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

                <div className="pdf-container" style={{ 
                    height: 'calc(100vh - 150px)', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    display: window.innerWidth > 768 ? 'block' : 'none'
                }}>
                    <PDFViewer width="100%" height="100%">
                        <ReportePedidoPDF pedido={datosParaPDF} />
                    </PDFViewer>
                </div>

                {window.innerWidth <= 768 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem', 
                        backgroundColor: '#fff3cd', 
                        borderRadius: '8px',
                        border: '1px solid #ffeaa7'
                    }}>
                        <h3>📱 Vista previa no disponible en móviles</h3>
                        <p>Haga clic en "💾 Descargar PDF" para ver el pedido.</p>
                        <div style={{ marginTop: '1rem' }}>
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
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (guardando) {
        return (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
                <h2>⏳ Guardando Pedido...</h2>
                <p>Por favor, espere mientras se procesa su solicitud.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📄 Confirmación de Pedido</h2>

            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p><strong>Cliente:</strong> {cliente?.razon_social}</p>
                <p>{cliente?.direccion} - {cliente?.localidad_nombre}</p>
                <p><strong>CUIT:</strong> {cliente?.cuit}</p>
                <p><strong>Forma de Pago:</strong> {formaPago}</p>
                <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>📅 Fecha de Entrega:</label>
                    <input
                        type="date"
                        value={fechaEntrega}
                        onChange={(e) => setFechaEntrega(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
                    />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="submit"
                        disabled={guardando}
                        className="boton-responsive"
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
// FrontEnd/src/components/ReportePedidoPDF.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: '1pt solid #000',
    },
    logo: {
        width: 80,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    section: {
        marginBottom: 15,
    },
    subsection: {
        marginBottom: 10,
    },
    table: {
        display: 'table',
        width: '100%',
        marginTop: 10,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '20%',
        border: '1px solid #000',
        padding: 5,
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
        fontSize: 9,
    },
    tableCol: {
        width: '20%',
        border: '1px solid #000',
        padding: 5,
        fontSize: 8,
    },
    total: {
        textAlign: 'right',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    },
});

// Componente principal del documento PDF
const ReportePedidoPDF = ({ pedido }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Encabezado */}
            <View style={styles.header}>
                {/* <Image style={styles.logo} src="/logo.png" /> */}
                <View>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Preventa Web</Text>
                    <Text>Reporte de Pedido</Text>
                    <Text>N°: {pedido.numeroPedido || 'PENDIENTE'}</Text>
                </View>
            </View>

            {/* Datos del Cliente */}
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Cliente:</Text>
                <Text>{pedido.cliente?.razon_social}</Text>
            </View>

            {/* Detalles del Pedido */}
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Detalles del Pedido:</Text>
                {/* ✅ Formatear la fecha */}
                <Text>Fecha de Vencimiento: {new Date(pedido.fechaVencimiento).toLocaleDateString()}</Text>
                <Text>Forma de Pago: {pedido.formaPago}</Text> {/* ✅ Usar formaPago (snake_case) */}
                <Text>Lista de Precios: {pedido.listaPrecios}</Text> {/* ✅ Usar listaPrecios (snake_case) */}
                <Text>Vendedor: {pedido.vendedor || 'No especificado'}</Text>
            </View>

            {/* Tabla de Productos */}
            {/* ✅ Asegurarse de que carrito exista y tenga elementos */}
            {pedido.carrito && pedido.carrito.length > 0 && (
                <View style={styles.section}>
                    <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Productos:</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableColHeader}>Código</Text>
                            <Text style={styles.tableColHeader}>Descripción</Text>
                            <Text style={styles.tableColHeader}>Cantidad</Text>
                            <Text style={styles.tableColHeader}>Precio Unit.</Text>
                            <Text style={styles.tableColHeader}>Importe</Text>
                        </View>
                        {pedido.carrito.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                {/* ✅ Asegurarse de que item.producto exista */}
                                <Text style={styles.tableCol}>{item.producto?.Codigo || 'N/A'}</Text>
                                <Text style={styles.tableCol}>{item.producto?.Descripcion || 'Producto sin descripción'}</Text>
                                <Text style={styles.tableCol}>{item.cantidad}</Text>
                                <Text style={styles.tableCol}>${Number(item.precioUnitario).toFixed(2)}</Text>
                                <Text style={styles.tableCol}>${Number(item.importe).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Total */}
            <Text style={styles.total}>TOTAL: ${Number(pedido.total).toFixed(2)}</Text>

            {/* Pie de página */}
            <Text style={styles.footer} fixed>
                Generado el {new Date().toLocaleString()} | Preventa Web © 2025
            </Text>
        </Page>
    </Document>
);

export default ReportePedidoPDF;
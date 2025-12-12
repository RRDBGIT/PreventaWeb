// C:\PreventaWeb\FrontEnd\src\components\ResumenCierreModal.jsx

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { getUsuario } from '../utils/auth';

const ResumenCierreModal = ({ isOpen, onClose, onConfirmarCierre }) => {
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setResumen(null);
            setLoading(false);
            setError(null);
            return;
        }

        const cargarResumen = async () => {
            setLoading(true);
            setError(null);
            try {
                const usuario = getUsuario();
                if (!usuario) {
                    throw new Error('Sesión no encontrada. Por favor, inicie sesión nuevamente.');
                }

                // ✅ Ajustado a TU estructura: { id: 1, nombre: "admin", ... }
                const idVendedor = Number(usuario.id);
                const nombreVendedor = usuario.nombre;

                if (!idVendedor || idVendedor <= 0 || isNaN(idVendedor)) {
                    throw new Error('ID de vendedor no válido en la sesión.');
                }

                // Llamar al backend con el ID correcto
                const response = await API.get(`/pedidos/cierre/resumen/${idVendedor}`);
                setResumen(response.data);
            } catch (err) {
                console.error('Error al cargar resumen de cierre:', err);
                setError(err.message || 'No se pudo cargar el resumen del día.');
            } finally {
                setLoading(false);
            }
        };

        cargarResumen();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#28a745' }}>
                    📅 Resumen de Cierre Diario
                </h2>

                {loading && <p style={{ textAlign: 'center' }}>Cargando resumen...</p>}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>❌ {error}</p>}

                {resumen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#e9f7ef', borderRadius: '6px', borderLeft: '4px solid #28a745' }}>
                            <p><strong>Vendedor:</strong> {resumen.nombreVendedor}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                                    {resumen.totalPedidos}
                                </p>
                                <p style={{ margin: 0, color: '#6c757d' }}>Pedidos</p>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                                    {resumen.totalClientesAtendidos}
                                </p>
                                <p style={{ margin: 0, color: '#6c757d' }}>Clientes</p>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '6px', textAlign: 'center', marginTop: '1rem' }}>
                            <p style={{ margin: 0, fontSize: '1.2rem' }}>
                                <strong>Total Facturado:</strong>
                            </p>
                            <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#dc3545' }}>
                                ${resumen.totalFacturado}
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.7rem 2rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={onConfirmarCierre}
                        disabled={loading || !!error || !resumen}
                        style={{
                            padding: '0.7rem 2rem',
                            backgroundColor: error ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (loading || error || !resumen) ? 'not-allowed' : 'pointer',
                            opacity: (loading || error || !resumen) ? 0.6 : 1
                        }}
                    >
                        ✅ Confirmar Cierre
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumenCierreModal;
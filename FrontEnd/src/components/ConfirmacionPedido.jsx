import React, { useState } from 'react';

const ConfirmacionPedido = ({ carrito, total, cliente, fechaVencimiento, formaPago, onConfirmar }) => {
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
        // Enviar al backend aquí si fuera necesario
        onConfirmar();
    };

    return (
        <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📄 Confirmación de Pedido</h2>

            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p><strong>Cliente:</strong> {cliente?.RazonSocial}</p>
                <p><strong>Fecha de Vencimiento:</strong> {fechaVencimiento}</p>
                <p><strong>Forma de Pago:</strong> {formaPago}</p>
                <p><strong>Total:</strong> ${total.toFixed(2)}</p>
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
                        style={{
                            padding: '0.7rem 2rem',
                            fontSize: '1.1rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ✅ Confirmar Pedido
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfirmacionPedido;
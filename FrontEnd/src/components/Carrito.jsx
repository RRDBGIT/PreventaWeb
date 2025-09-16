import React from 'react';

const Carrito = ({ items, onRemove, total }) => {
    return (
        <div style={{ marginTop: '1rem' }}>
            {items.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>El carrito está vacío</p>
            ) : (
                <>
                    <div style={{
                        display: 'flex',
                        fontWeight: 'bold',
                        padding: '0.5rem 0',
                        borderBottom: '2px solid #ddd',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ width: '20%' }}>Código</div>
                        <div style={{ width: '40%' }}>Descripción</div>
                        <div style={{ width: '15%', textAlign: 'center' }}>Cant.</div>
                        <div style={{ width: '15%', textAlign: 'right' }}>Precio</div>
                        <div style={{ width: '10%' }}></div>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
                        {items.map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                padding: '0.7rem 0',
                                borderBottom: '1px solid #eee',
                                alignItems: 'center',
                                fontSize: '0.95rem'
                            }}>
                                <div style={{ width: '20%' }}>{item.producto.Codigo}</div>
                                <div style={{ width: '40%' }}>{item.producto.Descripcion}</div>
                                <div style={{ width: '15%', textAlign: 'center' }}>{item.cantidad}</div>
                                <div style={{ width: '15%', textAlign: 'right' }}>${item.precioUnitario.toFixed(2)}</div>
                                <div style={{ width: '10%' }}>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        style={{
                                            padding: '0.2rem 0.5rem',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '2px solid #007bff',
                        fontWeight: 'bold',
                        textAlign: 'right',
                        fontSize: '1.2rem'
                    }}>
                        💰 Total: ${total.toFixed(2)}
                    </div>
                </>
            )}
        </div>
    );
};

export default Carrito;
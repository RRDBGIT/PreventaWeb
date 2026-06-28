// FrontEnd/src/components/Carrito.jsx

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
                        fontSize: '0.8rem'
                    }}>
                        <div style={{ width: '10%' }}>Cod</div>
                        <div style={{ width: '30%' }}>Descripción</div>
                        <div style={{ width: '8%', textAlign: 'center' }}>Cant.</div>
                        <div style={{ width: '37%', textAlign: 'right' }}>Precio</div>
                        <div style={{ width: '15%' }}></div>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
                        {items.map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                padding: '0.7rem 0',
                                borderBottom: '1px solid #eee',
                                alignItems: 'center',
                                fontSize: '0.8rem'
                            }}>
                                <div style={{ width: '10%' }}>{item.producto.Codigo}</div>
                                <div style={{ width: '30%' }}>{item.producto.Descripcion}</div>
                                <div style={{ width: '8%', textAlign: 'center' }}>{item.cantidad}</div>
                                <div style={{ 
                                    width: '37%', 
                                    textAlign: 'right',
                                    whiteSpace: 'nowrap'
                                }}>
                                    ${item.precioUnitario.toFixed(2)}
                                </div>
                                <div style={{ width: '15%' }}>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        style={{
                                            padding: '0.2rem 0.5rem',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem'
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
                        fontSize: '1.0rem'
                    }}>
                        💰 Total: ${total.toFixed(2)}
                    </div>
                </>
            )}
        </div>
    );
};

export default Carrito;
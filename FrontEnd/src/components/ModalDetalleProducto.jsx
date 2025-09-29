// FrontEnd/src/components/ModalDetalleProducto.jsx
import React, { useState } from 'react';

const ModalDetalleProducto = ({ producto, onClose, onAdd }) => {
    const [cantidad, setCantidad] = useState(1);

    const handleAgregar = () => {
        const cantidadNum = parseFloat(cantidad);
        if (!cantidadNum || cantidadNum <= 0) {
            alert("Cantidad inválida");
            return;
        }
        onAdd(producto, cantidadNum);
    };

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
                maxWidth: '90%',
                maxHeight: '90%',
                overflowY: 'auto'
            }}>
                <h2>📦 Detalle del Producto</h2>
                
                <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <p><strong>Código:</strong> {producto.Codigo}</p>
                    <p><strong>Descripción:</strong> {producto.Descripcion}</p>
                    <p><strong>Precio Unitario:</strong> ${parseFloat(producto.Precio).toFixed(2)}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label><strong>Cantidad:</strong> </label>
                    <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        style={{ 
                            width: '80px', 
                            marginLeft: '0.5rem', 
                            padding: '0.5rem', 
                            textAlign: 'center' 
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ❌ Cancelar
                    </button>
                    <button
                        onClick={handleAgregar}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ➕ Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleProducto;
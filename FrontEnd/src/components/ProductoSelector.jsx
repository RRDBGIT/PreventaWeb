// FrontEnd/src/components/ProductoSelector.jsx

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ModalDetalleProducto from './ModalDetalleProducto';

const ProductoSelector = ({ listaPreciosId, onAdd }) => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        if (!listaPreciosId) return;

        const cargarProductos = async () => {
            try {
                const res = await API.get(`/productos?lista=${listaPreciosId}`);
                const productosConPrecioNumerico = res.data.map(p => ({
                    ...p,
                    Precio: parseFloat(p.Precio)
                }));
                setProductos(productosConPrecioNumerico);
            } catch (error) {
                console.error("Error al cargar productos:", error);
                alert("Error al cargar el catálogo. Verifique la conexión o la lista seleccionada.");
            }
        };

        cargarProductos();
    }, [listaPreciosId]);

    const handleSeleccionarProducto = (producto) => {
        setProductoSeleccionado(producto);
        setMostrarModal(true);
    };

    const handleAgregarAlCarrito = (producto, cantidad) => {
        const precioNumerico = parseFloat(producto.Precio);
        onAdd(producto, cantidad, precioNumerico);
        setMostrarModal(false);
        setProductoSeleccionado(null);
    };

    const filtrados = productos.filter(p =>
        p.Codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.Descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div style={{ padding: '1rem' }}>
            <h3>📦 Cargar por Catálogo</h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Buscar por código o descripción"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                    style={{ 
                        flex: 1, 
                        padding: '0.5rem',
                        minWidth: '180px'
                    }}
                />
                <button
                    onClick={() => setMostrarCatalogo(!mostrarCatalogo)}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {mostrarCatalogo ? 'Ocultar Catálogo' : 'Mostrar Catálogo'}
                </button>
            </div>

            {mostrarCatalogo && (
                <div style={{ 
                    marginTop: '1rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    msOverflowStyle: '-ms-autohiding-scrollbar'
                }}>
                    <table style={{ 
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.7rem' // ✅ Fuente general más pequeña
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ 
                                    padding: '6px 8px',
                                    textAlign: 'left', 
                                    border: '1px solid #ddd',
                                    width: '12%',
                                    fontSize: '0.7rem' // ✅ Tamaño consistente
                                }}>Cod</th>
                                <th style={{ 
                                    padding: '6px 8px',
                                    textAlign: 'left', 
                                    border: '1px solid #ddd',
                                    width: '63%',
                                    fontSize: '0.7rem'
                                }}>Descripción</th>
                                <th style={{ 
                                    padding: '6px 8px',
                                    textAlign: 'right', 
                                    border: '1px solid #ddd',
                                    width: '25%',
                                    fontSize: '0.7rem'
                                }}>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ 
                                        padding: '16px', 
                                        textAlign: 'center', 
                                        fontStyle: 'italic',
                                        fontSize: '0.8rem'
                                    }}>
                                        {busqueda 
                                            ? `No se encontraron productos que coincidan con "${busqueda}"`
                                            : "No hay productos disponibles en esta lista de precios."
                                        }
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map(p => (
                                    <tr 
                                        key={p.IdProducto} 
                                        style={{ 
                                            borderBottom: '1px solid #eee',
                                            cursor: 'pointer',
                                            backgroundColor: '#fff',
                                            height: 'auto'
                                        }}
                                        onClick={() => handleSeleccionarProducto(p)}
                                    >
                                        <td style={{ 
                                            padding: '6px 8px', 
                                            border: '1px solid #ddd',
                                            wordBreak: 'break-word',
                                            fontSize: '0.75rem' // ✅ Ligeramente más grande para códigos
                                        }}>{p.Codigo}</td>
                                        <td style={{ 
                                            padding: '6px 8px', 
                                            border: '1px solid #ddd',
                                            wordBreak: 'break-word',
                                            lineHeight: '1.3',
                                            fontSize: '0.7rem'
                                        }}>{p.Descripcion}</td>
                                        <td style={{ 
                                            padding: '6px 8px', 
                                            border: '1px solid #ddd', 
                                            textAlign: 'right',
                                            wordBreak: 'break-word',
                                            fontSize: '0.65rem', // ✅ ¡Más pequeña solo en Precio!
                                            fontWeight: 'bold' // ✅ Para mantener legibilidad
                                        }}>
                                            ${parseFloat(p.Precio).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {mostrarModal && productoSeleccionado && (
                <ModalDetalleProducto
                    producto={productoSeleccionado}
                    onClose={() => {
                        setMostrarModal(false);
                        setProductoSeleccionado(null);
                    }}
                    onAdd={handleAgregarAlCarrito}
                />
            )}

            {mostrarCatalogo && (
                <div style={{ 
                    marginTop: '0.75rem', 
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: '#666'
                }}>
                    💡 Haga clic en cualquier producto para ver detalles y agregar al carrito.
                </div>
            )}
        </div>
    );
};

export default ProductoSelector;
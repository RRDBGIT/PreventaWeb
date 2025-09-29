// FrontEnd/src/components/ProductoSelector.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ModalDetalleProducto from './ModalDetalleProducto'; // ✅ Nuevo componente

const ProductoSelector = ({ listaPreciosId, onAdd }) => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null); // ✅ Estado para el modal
    const [mostrarModal, setMostrarModal] = useState(false); // ✅ Estado para mostrar/ocultar modal

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

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Buscar por código o descripción"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '0.5rem' }}
                />
                <button
                    onClick={() => setMostrarCatalogo(!mostrarCatalogo)}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
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
                    maxHeight: '300px', // ✅ Altura máxima
                    overflowY: 'auto', // ✅ Scroll vertical
                    overflowX: 'hidden' // ✅ Ocultar scroll horizontal
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ 
                                    padding: '8px', 
                                    textAlign: 'left', 
                                    border: '1px solid #ddd', 
                                    fontSize: '0.9rem',
                                    width: '20%' // ✅ Ancho reducido
                                }}>Código</th>
                                <th style={{ 
                                    padding: '8px', 
                                    textAlign: 'left', 
                                    border: '1px solid #ddd', 
                                    fontSize: '0.9rem',
                                    width: '60%' // ✅ Ancho reducido
                                }}>Descripción</th>
                                <th style={{ 
                                    padding: '8px', 
                                    textAlign: 'right', 
                                    border: '1px solid #ddd', 
                                    fontSize: '0.9rem',
                                    width: '20%' // ✅ Ancho reducido
                                }}>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                                        {busqueda 
                                            ? `No se encontraron productos que coincidan con "${busqueda}"`
                                            : "No hay productos disponibles en esta lista de precios. Verifique la configuración en la base de datos o el ID de la lista."
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
                                            fontSize: '0.85rem' // ✅ Fuente más pequeña
                                        }}
                                        onClick={() => handleSeleccionarProducto(p)} // ✅ Abrir modal al hacer clic
                                    >
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.Codigo}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.Descripcion}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                                            ${parseFloat(p.Precio).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ✅ Modal para detalle del producto */}
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
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <small>💡 Haga clic en cualquier producto para ver detalles y agregar al carrito.</small>
                </div>
            )}
        </div>
    );
};

export default ProductoSelector;
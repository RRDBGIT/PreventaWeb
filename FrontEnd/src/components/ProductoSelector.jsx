import React, { useState, useEffect } from 'react';
import API from '../services/api';

const ProductoSelector = ({ listaPreciosId, onAdd }) => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
    const [cantidadMap, setCantidadMap] = useState({});

    useEffect(() => {
        if (!listaPreciosId) return;

        const cargarProductos = async () => {
            try {
                // ✅ CORRECTO: Sin /api aquí, porque ya está en baseURL
                const res = await API.get(`/productos?lista=${listaPreciosId}`);
                const productosConPrecioNumerico = res.data.map(p => ({
                    ...p,
                    Precio: parseFloat(p.Precio)
                }));
                setProductos(productosConPrecioNumerico);

                const inicial = {};
                productosConPrecioNumerico.forEach(p => {
                    inicial[p.IdProducto] = 1;
                });
                setCantidadMap(inicial);
            } catch (error) {
                console.error("Error al cargar productos:", error);
                alert("Error al cargar el catálogo. Verifique la conexión o la lista seleccionada.");
            }
        };

        cargarProductos();
    }, [listaPreciosId]);

    const handleAdd = (producto) => {
        const cantidad = parseFloat(cantidadMap[producto.IdProducto]) || 1;
        if (cantidad <= 0) {
            alert("Cantidad inválida");
            return;
        }
        const precioNumerico = parseFloat(producto.Precio);
        onAdd(producto, cantidad, precioNumerico);
    };

    const handleCantidadChange = (id, valor) => {
        setCantidadMap(prev => ({
            ...prev,
            [id]: valor
        }));
    };

    const filtrados = productos.filter(p =>
        p.Codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.Descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>📦 Cargar por Catálogo</h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Buscar por código o descripción"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
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
                <div style={{ marginTop: '1rem', border: '1px solid #ccc', borderRadius: '4px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Código</th>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Descripción</th>
                                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Precio</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Cantidad</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                                        {busqueda 
                                            ? `No se encontraron productos que coincidan con "${busqueda}"`
                                            : "No hay productos disponibles en esta lista de precios."
                                        }
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map(p => (
                                    <tr key={p.IdProducto} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{p.Codigo}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{p.Descripcion}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                                            ${parseFloat(p.Precio).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={cantidadMap[p.IdProducto] || 1}
                                                onChange={(e) => handleCantidadChange(p.IdProducto, e.target.value)}
                                                style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleAdd(p)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ➕ Agregar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {mostrarCatalogo && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <small>💡 Puede modificar la cantidad antes de agregar cada producto.</small>
                </div>
            )}
        </div>
    );
};

export default ProductoSelector;
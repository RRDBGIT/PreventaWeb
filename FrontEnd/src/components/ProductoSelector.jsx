// FrontEnd/src/components/ProductoSelector.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import '../Index.css'; // ✅ Importar estilos globales

const ProductoSelector = ({ listaPreciosId, onAdd }) => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
    const [cantidadMap, setCantidadMap] = useState({});

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
                <div style={{ marginTop: '1rem', border: '1px solid #ccc', borderRadius: '4px', overflowX: 'auto' }}>
                    {/* ✅ Tabla con clase CSS para scroll horizontal en móviles */}
                    <table className="tabla-productos" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                {/* ❌ Columna "Código" eliminada para mejor vista en móviles */}
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd', fontSize: '0.9rem' }}>Descripción</th>
                                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd', fontSize: '0.9rem' }}>Precio</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', fontSize: '0.9rem', width: '80px' }}>Cant</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', fontSize: '0.9rem', width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                                        {busqueda 
                                            ? `No se encontraron productos que coincidan con "${busqueda}"`
                                            : "No hay productos disponibles en esta lista de precios. Verifique la configuración en la base de datos o el ID de la lista."
                                        }
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map(p => (
                                    <tr key={p.IdProducto} style={{ borderBottom: '1px solid #eee' }}>
                                        {/* ❌ Columna "Código" eliminada */}
                                        <td style={{ padding: '12px', border: '1px solid #ddd', fontSize: '0.85rem' }}>{p.Descripcion}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontSize: '0.85rem' }}>
                                            ${parseFloat(p.Precio).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={cantidadMap[p.IdProducto] || 1}
                                                onChange={(e) => handleCantidadChange(p.IdProducto, e.target.value)}
                                                style={{ width: '50px', padding: '4px', textAlign: 'center', fontSize: '0.85rem' }}
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
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                +
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
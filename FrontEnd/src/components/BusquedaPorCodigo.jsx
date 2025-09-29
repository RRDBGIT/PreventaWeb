// C:\PreventaWeb\FrontEnd\src\components\BusquedaPorCodigo.jsx

import React, { useState } from 'react';
import API from '../services/api';

const BusquedaPorCodigo = ({ listaPreciosId, onAdd }) => {
    const [codigo, setCodigo] = useState('');
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [error, setError] = useState('');

    const handleBuscar = async () => {
    if (!codigo || !listaPreciosId) {
        setError('Ingrese código y seleccione lista de precios');
        return;
    }

    try {
        // ✅ Enviar 'buscar' en lugar de 'codigo' para permitir búsqueda por nombre
        const res = await API.get(`/productos?lista=${listaPreciosId}&buscar=${encodeURIComponent(codigo)}`);
        
        if (res.data.length > 0) {
            // ✅ Tomar el primer resultado si hay varios
            const prod = res.data[0];
            setProducto(prod);
            setError('');
        } else {
            setProducto(null);
            setError('Producto no encontrado');
        }
    } catch (error) {
        console.error("Error en búsqueda por código:", error);
        setError('Error al buscar producto. Verifique conexión o lista seleccionada.');
    }
    };

    const handleAdd = () => {
        if (!producto) return alert("Primero busque un producto válido");
        const cantidadNum = parseFloat(cantidad);
        if (!cantidadNum || cantidadNum <= 0) return alert("Cantidad inválida");
        onAdd(producto, cantidadNum, producto.Precio);
        setCodigo('');
        setProducto(null);
        setCantidad(1);
    };

    return (
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>🔍 Buscar Producto por Código</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Código del producto"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '0.5rem' }}
                />
                <button onClick={handleBuscar} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Buscar
                </button>
            </div>

            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

            {producto && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', borderLeft: '4px solid #28a745' }}>
                    <strong>Código:</strong> {producto.Codigo}<br/>
                    <strong>Descripción:</strong> {producto.Descripcion}<br/>
                    <strong>Precio Unitario:</strong> ${parseFloat(producto.Precio).toFixed(2)}<br/>
                    <div style={{ marginTop: '0.5rem' }}>
                        <label><strong>Cantidad:</strong> </label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            min="1"
                            step="1"
                            style={{ width: '80px', marginLeft: '0.5rem', padding: '0.3rem', textAlign: 'center' }}
                        />
                        <button
                            onClick={handleAdd}
                            style={{ marginLeft: '1rem', padding: '0.4rem 1.2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                        >
                            ➕ Agregar al Carrito
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusquedaPorCodigo;
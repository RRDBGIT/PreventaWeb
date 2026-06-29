// FrontEnd/src/components/ResumenPedidosDia.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { getUsuario } from '../utils/auth';

const ResumenPedidosDia = ({ onVolver }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(null);

  // Establecer fecha actual por defecto
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaSeleccionada(hoy);
  }, []);

  // Cargar pedidos cuando cambia la fecha
  useEffect(() => {
    if (fechaSeleccionada) {
      cargarPedidos();
    }
  }, [fechaSeleccionada]);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const usuario = getUsuario();
      const response = await API.get(`/pedidos/resumen-dia?fecha=${fechaSeleccionada}&idVendedor=${usuario.id}`);
      setPedidos(response.data.pedidos || []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar los pedidos del día');
    } finally {
      setCargando(false);
    }
  };

  const handleEditarPedido = (pedido) => {
    // ✅ VALIDACIÓN: Verificar si el pedido está cerrado
    if (pedido.fin_del_dia !== null) {
      const fechaCierre = new Date(pedido.fin_del_dia).toLocaleString('es-AR');
      alert(`⚠️ Este pedido ya fue cerrado el ${fechaCierre} y no puede ser modificado.`);
      return;
    }
    setPedidoEditando(pedido);
  };

  const handleGuardarEdicion = async (pedidoActualizado) => {
    try {
      await API.put(`/pedidos/${pedidoActualizado.id_pedido}`, pedidoActualizado);
      alert('✅ Pedido actualizado correctamente');
      setPedidoEditando(null);
      cargarPedidos(); // Recargar lista
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      const mensaje = error.response?.data?.error || 'Error al actualizar el pedido';
      alert(`❌ ${mensaje}`);
    }
  };

  const handleVerDetalle = (pedido) => {
    setMostrarDetalle(pedido);
  };

  // ✅ NUEVA FUNCIÓN: Eliminar pedido
  const handleEliminarPedido = async (pedido) => {
    // ✅ VALIDACIÓN: Verificar si el pedido está cerrado
    if (pedido.fin_del_dia !== null) {
      const fechaCierre = new Date(pedido.fin_del_dia).toLocaleString('es-AR');
      alert(`⚠️ Este pedido ya fue cerrado el ${fechaCierre} y no puede ser eliminado.`);
      return;
    }

    // ✅ Confirmación antes de eliminar
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el pedido ${pedido.numero_pedido}?\n\n` +
      `Cliente: ${pedido.razon_social_cliente}\n` +
      `Total: $${parseFloat(pedido.total).toFixed(2)}\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      await API.delete(`/pedidos/${pedido.id_pedido}`);
      alert('✅ Pedido eliminado correctamente');
      cargarPedidos(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      const mensaje = error.response?.data?.error || 'Error al eliminar el pedido';
      alert(`❌ ${mensaje}`);
    }
  };

  const calcularTotales = () => {
    const totalPedidos = pedidos.length;
    const totalFacturado = pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    const clientesUnicos = new Set(pedidos.map(p => p.id_cliente)).size;
    
    return {
      totalPedidos,
      totalFacturado: totalFacturado.toFixed(2),
      clientesUnicos
    };
  };

  const totales = calcularTotales();

  if (pedidoEditando) {
    return (
      <EditorPedido 
        pedido={pedidoEditando}
        onGuardar={handleGuardarEdicion}
        onCancelar={() => setPedidoEditando(null)}
      />
    );
  }

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>📊 Resumen de Pedidos</h2>
        <button
          onClick={onVolver}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Volver
        </button>
      </div>

      {/* Selector de fecha */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <label style={{ fontWeight: 'bold', marginRight: '1rem' }}>📅 Fecha:</label>
        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Totales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          backgroundColor: '#28a745', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Pedidos</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totales.totalPedidos}</div>
        </div>
        <div style={{ 
          backgroundColor: '#007bff', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Facturación</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${totales.totalFacturado}</div>
        </div>
        <div style={{ 
          backgroundColor: '#ffc107', 
          color: '#000', 
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Clientes</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totales.clientesUnicos}</div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {cargando ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cargando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <p>No hay pedidos para esta fecha</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>N° Pedido</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Cliente</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Items</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Estado</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, index) => (
                  <tr key={pedido.id_pedido} style={{ 
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                    borderBottom: '1px solid #eee'
                  }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{pedido.numero_pedido}</strong>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div>{pedido.razon_social_cliente}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {pedido.forma_pago}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                      ${parseFloat(pedido.total).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {pedido.cantidad_items || 0}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {pedido.fin_del_dia !== null ? (
                        <span style={{ 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          🔒 Cerrado
                        </span>
                      ) : (
                        <span style={{ 
                          backgroundColor: '#28a745', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          ✅ Abierto
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleVerDetalle(pedido)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Ver detalle"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditarPedido(pedido)}
                          disabled={pedido.fin_del_dia !== null}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: pedido.fin_del_dia !== null ? '#6c757d' : '#ffc107',
                            color: pedido.fin_del_dia !== null ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: pedido.fin_del_dia !== null ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            opacity: pedido.fin_del_dia !== null ? 0.5 : 1
                          }}
                          title={pedido.fin_del_dia !== null ? 'Pedido cerrado - no editable' : 'Editar pedido'}
                        >
                          ✏️
                        </button>
                        {/* ✅ NUEVO: Botón de eliminar */}
                        <button
                          onClick={() => handleEliminarPedido(pedido)}
                          disabled={pedido.fin_del_dia !== null}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: pedido.fin_del_dia !== null ? '#6c757d' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: pedido.fin_del_dia !== null ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            opacity: pedido.fin_del_dia !== null ? 0.5 : 1
                          }}
                          title={pedido.fin_del_dia !== null ? 'Pedido cerrado - no eliminable' : 'Eliminar pedido'}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {mostrarDetalle && (
        <ModalDetallePedido 
          pedido={mostrarDetalle}
          onCerrar={() => setMostrarDetalle(null)}
        />
      )}
    </div>
  );
};

// Componente para ver detalle del pedido
const ModalDetallePedido = ({ pedido, onCerrar }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>📋 Detalle del Pedido</h3>
          <button
            onClick={onCerrar}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p><strong>N° Pedido:</strong> {pedido.numero_pedido}</p>
          <p><strong>Cliente:</strong> {pedido.razon_social_cliente}</p>
          <p><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString('es-AR')}</p>
          <p><strong>Forma de Pago:</strong> {pedido.forma_pago}</p>
          <p><strong>Lista de Precios:</strong> {pedido.lista_precios}</p>
          <p><strong>Fecha de Entrega:</strong> {pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR') : 'No definida'}</p>
          <p><strong>Fecha de Vencimiento:</strong> {new Date(pedido.fecha_vencimiento).toLocaleDateString('es-AR')}</p>
          {pedido.fin_del_dia !== null && (
            <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
              🔒 Pedido cerrado el: {new Date(pedido.fin_del_dia).toLocaleString('es-AR')}
            </p>
          )}
        </div>

        <h4>Productos</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Código</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Cant.</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Precio</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items?.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{item.codigo_producto}</td>
                  <td style={{ padding: '0.5rem' }}>{item.descripcion_producto}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.cantidad}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>${parseFloat(item.precio_unitario).toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                    ${parseFloat(item.importe).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                <td colSpan="4" style={{ padding: '0.5rem', textAlign: 'right' }}>TOTAL:</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '1.1rem' }}>
                  ${parseFloat(pedido.total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ✅ COMPONENTE MEJORADO: Editor de pedido completo (cabecera + items)
// ✅ CORREGIDO: Ahora incluye id_pedido en los datos enviados
const EditorPedido = ({ pedido, onGuardar, onCancelar }) => {
  const [pedidoEditado, setPedidoEditado] = useState({
    ...pedido,
    fecha_entrega: pedido.fecha_entrega?.split('T')[0] || '',
    fecha_vencimiento: pedido.fecha_vencimiento?.split('T')[0] || ''
  });

  const [items, setItems] = useState(
    pedido.items?.map(item => ({
      ...item,
      cantidad: item.cantidad,
      precio_unitario: parseFloat(item.precio_unitario)
    })) || []
  );

  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  // ✅ CORREGIDO: Cargar catálogo de productos con filtro de lista de precios
  useEffect(() => {
    const cargarProductos = async () => {
      if (!pedido.id_lista_precios) {
        console.warn('⚠️ No hay ID de lista de precios para este pedido');
        return;
      }

      setCargandoProductos(true);
      try {
        console.log(`📦 Cargando productos para lista ${pedido.id_lista_precios}`);
        const response = await API.get(`/productos?lista=${pedido.id_lista_precios}`);
        const productosConPrecioNumerico = response.data.map(p => ({
          ...p,
          Precio: parseFloat(p.Precio)
        }));
        setProductosDisponibles(productosConPrecioNumerico);
        console.log(`✅ ${productosConPrecioNumerico.length} productos cargados`);
      } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        alert('Error al cargar el catálogo de productos. Verifique la conexión.');
      } finally {
        setCargandoProductos(false);
      }
    };
    cargarProductos();
  }, [pedido.id_lista_precios]);

  // Calcular total automáticamente
  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.importe) || 0), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPedidoEditado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const nuevosItems = [...items];
    nuevosItems[index][field] = value;

    // Recalcular importe si cambia cantidad o precio
    if (field === 'cantidad' || field === 'precio_unitario') {
      const cantidad = parseFloat(nuevosItems[index].cantidad) || 0;
      const precio = parseFloat(nuevosItems[index].precio_unitario) || 0;
      nuevosItems[index].importe = cantidad * precio;
    }

    setItems(nuevosItems);
  };

  const handleEliminarItem = (index) => {
    if (window.confirm('¿Estás seguro de eliminar este item?')) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleAgregarProducto = (producto) => {
    const nuevoItem = {
      id_producto: producto.IdProducto,
      codigo_producto: producto.Codigo,
      descripcion_producto: producto.Descripcion,
      cantidad: 1,
      precio_unitario: parseFloat(producto.Precio) || 0,
      importe: parseFloat(producto.Precio) || 0,
      id_lista: pedido.id_lista_precios || null
    };
    setItems([...items, nuevoItem]);
    setMostrarBuscador(false);
    setBusquedaProducto('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('⚠️ El pedido debe tener al menos un item');
      return;
    }

    setCargando(true);

    try {
      // ✅ CORREGIDO: Ahora incluye id_pedido en los datos enviados
      const datosActualizados = {
        id_pedido: pedido.id_pedido, // ✅ CLAVE: Agregar el ID del pedido
        fecha_entrega: pedidoEditado.fecha_entrega,
        fecha_vencimiento: pedidoEditado.fecha_vencimiento,
        items: items.map(item => ({
          id_producto: item.id_producto,
          id_lista: item.id_lista || pedido.id_lista_precios,
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio_unitario),
          importe: parseFloat(item.importe)
        })),
        total: calcularTotal()
      };

      await onGuardar(datosActualizados);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar los cambios');
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productosDisponibles.filter(p => 
    p.Codigo?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    p.Descripcion?.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>✏️ Editar Pedido {pedido.numero_pedido}</h2>

        <form onSubmit={handleSubmit}>
          {/* Sección de Fechas */}
          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ marginTop: 0 }}>📅 Información del Pedido</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Cliente
                </label>
                <input
                  type="text"
                  value={pedido.razon_social_cliente}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Lista de Precios
                </label>
                <input
                  type="text"
                  value={pedido.lista_precios || 'No definida'}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  📅 Fecha de Entrega
                </label>
                <input
                  type="date"
                  name="fecha_entrega"
                  value={pedidoEditado.fecha_entrega}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  📅 Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={pedidoEditado.fecha_vencimiento}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sección de Items */}
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>🛒 Productos del Pedido</h4>
              <button
                type="button"
                onClick={() => setMostrarBuscador(true)}
                disabled={cargandoProductos || productosDisponibles.length === 0}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: cargandoProductos || productosDisponibles.length === 0 ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: cargandoProductos || productosDisponibles.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {cargandoProductos ? '⏳ Cargando catálogo...' : '➕ Agregar Producto'}
              </button>
            </div>

            {cargandoProductos && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                Cargando catálogo de productos...
              </div>
            )}

            {!cargandoProductos && productosDisponibles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#dc3545' }}>
                ⚠️ No se pudieron cargar los productos. Verifique que el pedido tenga una lista de precios asignada.
              </div>
            )}

            {items.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', margin: '1rem 0' }}>
                No hay productos en el pedido. Agregá al menos uno.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Código</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Descripción</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Cant.</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Precio</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Total</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.5rem' }}>{item.codigo_producto}</td>
                        <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{item.descripcion_producto}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.cantidad}
                            onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                            style={{
                              width: '60px',
                              padding: '0.25rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              textAlign: 'right'
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precio_unitario}
                            onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                            style={{
                              width: '80px',
                              padding: '0.25rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              textAlign: 'right'
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                          ${parseFloat(item.importe).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleEliminarItem(index)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                            title="Eliminar item"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <td colSpan="4" style={{ padding: '0.5rem', textAlign: 'right' }}>TOTAL:</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '1.1rem' }}>
                        ${calcularTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancelar}
              disabled={cargando}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: cargando ? 'not-allowed' : 'pointer'
              }}
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || items.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: cargando || items.length === 0 ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: cargando || items.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {cargando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de búsqueda de productos */}
      {mostrarBuscador && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>🔍 Buscar Producto</h3>
              <button
                onClick={() => {
                  setMostrarBuscador(false);
                  setBusquedaProducto('');
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value.toUpperCase())}
              autoFocus
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}
            />

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {productosFiltrados.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>
                  {busquedaProducto 
                    ? `No se encontraron productos que coincidan con "${busquedaProducto}"`
                    : "No hay productos disponibles en esta lista de precios."
                  }
                </p>
              ) : (
                productosFiltrados.map(producto => (
                  <div
                    key={producto.IdProducto}
                    onClick={() => handleAgregarProducto(producto)}
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{producto.Codigo}</strong> - {producto.Descripcion}
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                        ${parseFloat(producto.Precio).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenPedidosDia;
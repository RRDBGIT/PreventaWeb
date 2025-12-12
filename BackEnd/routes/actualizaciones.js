// BackEnd/routes/actualizaciones.js
const express = require('express');
const actualizacionesRouter = require('./actualizaciones/index');
const { obtenerPedidosListos, obtenerDetallesPorPedido, obtenerGeolocalizacionClientes } = require('../controllers/actualizacionController');
const { obtenerPedidosSinCerrar } = require('../controllers/actualizacionController');


// ✅ Agregar las nuevas rutas AL ROUTER EXISTENTE
actualizacionesRouter.get('/pedidos-listos', obtenerPedidosListos);
actualizacionesRouter.get('/detalles-por-pedido/:numeroPedido', obtenerDetallesPorPedido);
actualizacionesRouter.get('/clientes-geolocalizacion', obtenerGeolocalizacionClientes); // ✅ Corregido
actualizacionesRouter.get('/pedidos-sin-cerrar', obtenerPedidosSinCerrar);
// ✅ Exportar el mismo router (ahora con las nuevas rutas)

module.exports = actualizacionesRouter;
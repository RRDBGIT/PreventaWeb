// BackEnd/routes/actualizaciones/index.js
const express = require('express');
const router = express.Router();

// Importar APIs de sincronización
const apiClientes = require('./api-clientes');
const apiLocalidades = require('./api-localidades');
const apiListasDePrecios = require('./api-listas-de-precios');
const apiPreciosPorLista = require('./api-precios-por-lista');
const apiProductos = require('./api-productos');
const apiUsuarios = require('./api-usuarios'); // 🔥 Nuevo

// Montar rutas
router.use('/api-clientes', apiClientes);
router.use('/api-localidades', apiLocalidades);
router.use('/api-listas-de-precios', apiListasDePrecios);
router.use('/api-precios-por-lista', apiPreciosPorLista);
router.use('/api-productos', apiProductos);
router.use('/api-usuarios', apiUsuarios); // 🔥 Nuevo

module.exports = router;
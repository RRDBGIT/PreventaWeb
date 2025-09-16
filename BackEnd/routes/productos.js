const express = require('express');
const router = express.Router();
const { obtenerProductos } = require('../controllers/productoController');

router.get('/', obtenerProductos);

module.exports = router;
const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente } = require('../controllers/clienteController');

router.get('/', obtenerClientes);
router.post('/', crearCliente);

module.exports = router;
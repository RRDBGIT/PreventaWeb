// BackEnd/routes/pedidos.js
const express = require('express');
const router = express.Router();
const { crearPedido, obtenerPedidosPorVendedor } = require('../controllers/pedidoController');

router.post('/', crearPedido);
router.get('/vendedor/:idVendedor', obtenerPedidosPorVendedor); // ✅ Nueva ruta

module.exports = router;
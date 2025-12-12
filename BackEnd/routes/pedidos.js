// BackEnd/routes/pedidos.js
const express = require('express');
const router = express.Router();
const { 
  crearPedido, 
  obtenerPedidosPorVendedor, 
  cerrarDia,
  obtenerResumenCierre   // ✅ Agregar aquí
} = require('../controllers/pedidoController');

router.post('/', crearPedido);
router.get('/vendedor/:idVendedor', obtenerPedidosPorVendedor);
router.post('/cerrar-dia', cerrarDia);
router.get('/cierre/resumen/:idVendedor', obtenerResumenCierre); // ✅ Nueva ruta

module.exports = router;
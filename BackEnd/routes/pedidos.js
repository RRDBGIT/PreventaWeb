// BackEnd/routes/pedidos.js
const express = require('express');
const router = express.Router();
const { 
  crearPedido, 
  obtenerPedidosPorVendedor, 
  cerrarDia,
  obtenerResumenCierre,
  obtenerResumenDia,    // ✅ Nueva función
  editarPedido,         // ✅ Nueva función
  eliminarPedido        // ✅ Nueva función
} = require('../controllers/pedidoController');

// ✅ Rutas existentes
router.post('/', crearPedido);
router.get('/vendedor/:idVendedor', obtenerPedidosPorVendedor);
router.post('/cerrar-dia', cerrarDia);
router.get('/cierre/resumen/:idVendedor', obtenerResumenCierre);

// ✅ NUEVAS RUTAS: Resumen de pedidos del día, edición y eliminación
// ⚠️ IMPORTANTE: /resumen-dia debe ir ANTES de /:id para que Express no lo confunda con un parámetro
router.get('/resumen-dia', obtenerResumenDia);
router.put('/:id', editarPedido);
router.delete('/:id', eliminarPedido);

module.exports = router;
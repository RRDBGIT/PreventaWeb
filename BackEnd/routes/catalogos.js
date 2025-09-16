const express = require('express');
const router = express.Router();

const { obtenerLocalidades } = require('../controllers/localidadController');
const { obtenerFormasPago } = require('../controllers/formaPagoController');
const { obtenerListasPrecios } = require('../controllers/listaPreciosController'); // ← ¡Agrega esta línea!

router.get('/localidades', obtenerLocalidades);
router.get('/formas-pago', obtenerFormasPago);
router.get('/listas-precios', obtenerListasPrecios); // ← ¡Agrega esta línea!

module.exports = router;
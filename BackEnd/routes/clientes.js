//C:\PreventaWeb\BackEnd\routes\Clientes.js
const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente } = require('../controllers/clienteController');

// Ruta para obtener todos los clientes
router.get('/', obtenerClientes);

// Ruta para crear un cliente
router.post('/', crearCliente);

// 🔴 Ruta para obtener clientes con geolocalización
router.get('/ubicacion', async (req, res) => {
  const db = require('../models/db'); // ✅ Corregido: ruta correcta
  try {
    const query = `
      SELECT 
        IdCliente,
        RazonSocial,
        Direccion,
        ST_X(geolocalizacion) AS latitud,
        ST_Y(geolocalizacion) AS longitud
      FROM Clientes
      WHERE ST_X(geolocalizacion) IS NOT NULL AND ST_Y(geolocalizacion) IS NOT NULL
      ORDER BY IdCliente
    `;
    const [clientes] = await db.execute(query);
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 🔴 Ruta para obtener un cliente por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const db = require('../models/db'); // ✅ Corregido: ruta correcta
  try {
    const query = `
      SELECT 
        IdCliente,
        NumeroCliente,
        RazonSocial,
        Direccion,
        Telefono,
        IdLocalidad,
        CUIT,
        Saldo,
        ST_X(geolocalizacion) AS latitud,
        ST_Y(geolocalizacion) AS longitud
      FROM Clientes
      WHERE IdCliente = ?
    `;
    const [cliente] = await db.execute(query, [id]);
    if (cliente.length > 0) {
      res.json(cliente[0]);
    } else {
      res.status(404).json({ error: 'Cliente no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 🔴 Ruta para actualizar un cliente por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    razon_social, 
    direccion, 
    telefono, 
    id_localidad, 
    cuit, 
    saldo, 
    latitud, 
    longitud 
  } = req.body;

  const db = require('../models/db'); // ✅ Corregido: ruta correcta

  try {
    const query = `
      UPDATE Clientes
      SET
        RazonSocial = ?,
        Direccion = ?,
        Telefono = ?,
        IdLocalidad = ?,
        CUIT = ?,
        Saldo = ?,
        geolocalizacion = POINT(?, ?)
      WHERE IdCliente = ?
    `;
    await db.execute(query, [
      razon_social,
      direccion,
      telefono,
      id_localidad,
      cuit,
      saldo,
      latitud,
      longitud,
      id
    ]);

    // Obtener cliente actualizado
    const [clienteActualizado] = await db.execute(
      'SELECT * FROM Clientes WHERE IdCliente = ? ORDER BY IdCliente', [id]
    );

    if (clienteActualizado.length > 0) {
      res.json(clienteActualizado[0]);
    } else {
      res.status(404).json({ error: 'Cliente no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
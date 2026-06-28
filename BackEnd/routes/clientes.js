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
  const db = require('../models/db');
  try {
    const query = `
      SELECT 
        IdCliente,
        RazonSocial,
        Direccion,
        ST_X(geolocalizacion) AS longitud,
        ST_Y(geolocalizacion) AS latitud
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
  const db = require('../models/db');
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
        ST_X(geolocalizacion) AS longitud,
        ST_Y(geolocalizacion) AS latitud
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

// 🔴 Ruta para actualizar un cliente por ID - ✅ CORREGIDO
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

  const db = require('../models/db');

  try {
    let query;
    let params;

    // ✅ Si hay coordenadas válidas, actualizar geolocalizacion
    if (latitud != null && longitud != null && !isNaN(latitud) && !isNaN(longitud)) {
      query = `
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
      params = [
        razon_social,
        direccion,
        telefono,
        id_localidad,
        cuit,
        saldo,
        parseFloat(longitud),   // ✅ PRIMERO longitud (ST_X)
        parseFloat(latitud),    // ✅ SEGUNDO latitud (ST_Y)
        id
      ];
    } else {
      // ✅ Si no hay coordenadas válidas, no actualizar geolocalizacion
      query = `
        UPDATE Clientes
        SET
          RazonSocial = ?,
          Direccion = ?,
          Telefono = ?,
          IdLocalidad = ?,
          CUIT = ?,
          Saldo = ?
        WHERE IdCliente = ?
      `;
      params = [
        razon_social,
        direccion,
        telefono,
        id_localidad,
        cuit,
        saldo,
        id
      ];
    }

    await db.execute(query, params);

    // ✅ Obtener cliente actualizado con coordenadas correctas
    const [clienteActualizado] = await db.execute(`
      SELECT 
        IdCliente,
        NumeroCliente,
        RazonSocial,
        Direccion,
        Telefono,
        IdLocalidad,
        CUIT,
        Saldo,
        ST_Y(geolocalizacion) AS latitud,
        ST_X(geolocalizacion) AS longitud
      FROM Clientes
      WHERE IdCliente = ?
    `, [id]);

    if (clienteActualizado.length > 0) {
      console.log(`✅ Cliente ${id} actualizado. Coordenadas: Lat=${clienteActualizado[0].latitud}, Lng=${clienteActualizado[0].longitud}`);
      res.json(clienteActualizado[0]);
    } else {
      res.status(404).json({ error: 'Cliente no encontrado' });
    }
  } catch (error) {
    console.error(`❌ Error al actualizar cliente ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
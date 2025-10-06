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
        ST_Y(geolocalizacion) AS latitud,  -- ✅ Corregido: ST_Y es latitud
        ST_X(geolocalizacion) AS longitud -- ✅ Corregido: ST_X es longitud
      FROM Clientes
      WHERE ST_X(geolocalizacion) IS NOT NULL AND ST_Y(geolocalizacion) IS NOT NULL
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
        ST_Y(geolocalizacion) AS latitud,  -- ✅ Corregido: ST_Y es latitud
        ST_X(geolocalizacion) AS longitud -- ✅ Corregido: ST_X es longitud
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
  // Extraer latitud y longitud del cuerpo de la solicitud
  const { 
    razon_social, 
    direccion, 
    telefono, 
    id_localidad, 
    cuit, 
    saldo, 
    latitud,    // Ej: -34.6082
    longitud    // Ej: -58.4193
  } = req.body;

  const db = require('../models/db'); // ✅ Corregido: ruta correcta

  try {
    // 1. ✅ Actualizar el cliente
    //    El estándar para POINT en SRID 4326 es POINT(longitud, latitud)
    const updateQuery = `
      UPDATE Clientes
      SET
        RazonSocial = ?,
        Direccion = ?,
        Telefono = ?,
        IdLocalidad = ?,
        CUIT = ?,
        Saldo = ?,
        geolocalizacion = POINT(?, ?) -- POINT(longitud, latitud)
      WHERE IdCliente = ?
    `;
    const [updateResult] = await db.execute(updateQuery, [
      razon_social,
      direccion,
      telefono,
      id_localidad,
      cuit,
      saldo,
      longitud,  // <- PRIMERO: longitud (X)
      latitud,   // <- SEGUNDO:  latitud  (Y)
      id
    ]);

    // 2. ✅ Verificar si se actualizó alguna fila
    if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado para actualizar' });
    }

    // 3. ✅ Obtener el cliente actualizado con latitud y longitud extraídas correctamente
    //    ST_Y(point) devuelve la coordenada Y, que ES la latitud.
    //    ST_X(point) devuelve la coordenada X, que ES la longitud.
    const selectQuery = `
      SELECT 
        IdCliente,
        NumeroCliente,
        RazonSocial,
        Direccion,
        Telefono,
        IdLocalidad,
        CUIT,
        Saldo,
        ST_Y(geolocalizacion) AS latitud,  -- ST_Y es latitud
        ST_X(geolocalizacion) AS longitud  -- ST_X es longitud
      FROM Clientes
      WHERE IdCliente = ?
    `;
    const [clienteActualizado] = await db.execute(selectQuery, [id]);

    // 4. ✅ Verificar si se obtuvo el cliente
    if (clienteActualizado.length > 0) {
      res.json(clienteActualizado[0]); // {"latitud": -34.6082, "longitud": -58.4193}
    } else {
      res.status(500).json({ error: 'Error al recuperar el cliente actualizado' });
    }
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el cliente.' });
  }
});


module.exports = router;
// BackEnd/routes/actualizaciones/api-clientes.js
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

/**
 * @route   GET /api/actualizaciones/api-clientes
 * @desc    Obtener todos los clientes para sincronización
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.IdCliente AS id_cliente,
                c.NumeroCliente AS numero_cliente,
                c.RazonSocial AS razon_social,
                c.Direccion AS direccion,
                c.Telefono AS telefono,
                c.CUIT AS cuit,
                c.Saldo AS saldo,
                l.Nombre AS localidad_nombre,
                l.IdProvincia AS id_provincia,
                prov.Nombre AS provincia_nombre,
                ST_Y(c.geolocalizacion) AS latitud,  -- ST_Y es latitud
                ST_X(c.geolocalizacion) AS longitud   -- ST_X es longitud
            FROM Clientes c
            LEFT JOIN Localidades l ON c.IdLocalidad = l.IdLocalidad
            LEFT JOIN Provincias prov ON l.IdProvincia = prov.IdProvincia
            ORDER BY c.IdCliente
        `;
        const [clientes] = await db.execute(query);
        res.json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes.' });
    }
});

/**
 * @route   GET /api/actualizaciones/api-clientes/:id
 * @desc    Obtener un cliente por ID
 * @access  Público (⚠️ En producción, proteger)
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                c.IdCliente AS id_cliente,
                c.NumeroCliente AS numero_cliente,
                c.RazonSocial AS razon_social,
                c.Direccion AS direccion,
                c.Telefono AS telefono,
                c.IdLocalidad AS id_localidad,
                c.CUIT AS cuit,
                c.Saldo AS saldo,
                l.Nombre AS localidad_nombre,
                l.IdProvincia AS id_provincia,
                prov.Nombre AS provincia_nombre,
                ST_Y(c.geolocalizacion) AS latitud,  -- ST_Y es latitud
                ST_X(c.geolocalizacion) AS longitud   -- ST_X es longitud
            FROM Clientes c
            LEFT JOIN Localidades l ON c.IdLocalidad = l.IdLocalidad
            LEFT JOIN Provincias prov ON l.IdProvincia = prov.IdProvincia
            WHERE c.IdCliente = ?
        `;
        const [cliente] = await db.execute(query, [id]);
        
        if (cliente.length > 0) {
            res.json(cliente[0]);
        } else {
            res.status(404).json({ error: 'Cliente no encontrado.' });
        }
    } catch (error) {
        console.error(`Error al obtener cliente con ID ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el cliente.' });
    }
});

/**
 * @route   PUT /api/actualizaciones/api-clientes/batch
 * @desc    Actualizar o insertar múltiples clientes
 * @access  Público (⚠️ En producción, proteger)
 */
router.put('/batch', async (req, res) => {
    const { clientes } = req.body;

    if (!Array.isArray(clientes) || clientes.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de clientes.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const resultados = {
            creados: 0,
            actualizados: 0,
            errores: []
        };

        for (const cliente of clientes) {
            try {
                // Verificar si el cliente existe
                const [existing] = await connection.execute(
                    'SELECT IdCliente FROM Clientes WHERE IdCliente = ?',
                    [cliente.id_cliente]
                );

                if (existing.length > 0) {
                    // Actualizar cliente existente
                    let updateQuery = `
                        UPDATE Clientes SET
                            NumeroCliente = ?,
                            RazonSocial = ?,
                            Direccion = ?,
                            Telefono = ?,
                            IdLocalidad = ?,
                            CUIT = ?,
                            Saldo = ?
                    `;
                    let updateParams = [
                        cliente.numero_cliente,
                        cliente.razon_social,
                        cliente.direccion,
                        cliente.telefono || null,
                        cliente.id_localidad || null,
                        cliente.cuit,
                        cliente.saldo || 0
                    ];

                    // Si se proporcionan coordenadas, actualizar también el campo geolocalizacion
                    if (cliente.latitud != null && cliente.longitud != null) {
                        updateQuery += `, geolocalizacion = POINT(?, ?)`;
                        updateParams.push(cliente.longitud, cliente.latitud); // POINT(longitud, latitud)
                    }
                    updateQuery += ` WHERE IdCliente = ?`;
                    updateParams.push(cliente.id_cliente);

                    const [updateResult] = await connection.execute(updateQuery, updateParams);
                    resultados.actualizados += updateResult.affectedRows;
                } else {
                    // Insertar nuevo cliente
                    let insertQuery = `
                        INSERT INTO Clientes (
                            IdCliente, NumeroCliente, RazonSocial, Direccion, Telefono, 
                            IdLocalidad, CUIT, Saldo
                    `;
                    let insertParams = [
                        cliente.id_cliente,
                        cliente.numero_cliente,
                        cliente.razon_social,
                        cliente.direccion,
                        cliente.telefono || null,
                        cliente.id_localidad || null,
                        cliente.cuit,
                        cliente.saldo || 0
                    ];

                    if (cliente.latitud != null && cliente.longitud != null) {
                        insertQuery += `, geolocalizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, POINT(?, ?))`;
                        insertParams.push(cliente.longitud, cliente.latitud); // POINT(longitud, latitud)
                    } else {
                        insertQuery += `) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    }

                    await connection.execute(insertQuery, insertParams);
                    resultados.creados += 1;
                }
            } catch (clienteError) {
                console.error(`Error procesando cliente ID ${cliente.id_cliente}:`, clienteError);
                resultados.errores.push({
                    id_cliente: cliente.id_cliente,
                    error: clienteError.message
                });
            }
        }

        await connection.commit();
        res.json({
            message: 'Proceso de actualización/creación completado.',
            resultados
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error general en actualización batch de clientes:", error);
        res.status(500).json({ error: 'Error interno del servidor durante la actualización.' });
    } finally {
        if (connection) connection.release();
    }
});

// Variable global para controlar si ya se borró la tabla en esta ejecución
let tablaBorradaEnEstaEjecucion = false;

/**
 * @route   POST /api/actualizaciones/api-clientes/sync
 * @desc    Sincronizar completamente la tabla Clientes (eliminar y recrear)
 * @access  Público (⚠️ En producción, proteger)
 * @note    Este endpoint acepta lotes. Borra TODO solo una vez por ejecución.
 */
router.post('/sync', async (req, res) => {
    const { clientes } = req.body;

    if (!Array.isArray(clientes) || clientes.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de clientes para sincronizar.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Solo borrar una vez por ejecución del servidor
        if (!tablaBorradaEnEstaEjecucion) {
            console.log('[SYNC] Borrando todos los registros existentes (primera vez en esta ejecución)...');
            await connection.execute('DELETE FROM Clientes');
            tablaBorradaEnEstaEjecucion = true; // Marcar como borrada
            console.log('[SYNC] Registros eliminados.');
        } else {
            console.log('[SYNC] Ya se borró la tabla en esta ejecución. Saltando borrado.');
        }

        // 2. Insertar todos los registros del lote actual
        let totalInsertados = 0;
        for (const cliente of clientes) {
            // Validar campos requeridos
            if (cliente.id_cliente == null || cliente.numero_cliente == null || cliente.razon_social == null) {
                throw new Error('Faltan campos requeridos: id_cliente, numero_cliente, razon_social');
            }

            let insertQuery = `
                INSERT INTO Clientes (
                    IdCliente, NumeroCliente, RazonSocial, Direccion, Telefono, 
                    IdLocalidad, CUIT, Saldo
            `;
            let insertParams = [
                cliente.id_cliente,
                cliente.numero_cliente,
                cliente.razon_social,
                cliente.direccion,
                cliente.telefono || null,
                cliente.id_localidad || null,
                cliente.cuit,
                cliente.saldo || 0
            ];

            if (cliente.latitud != null && cliente.longitud != null) {
                insertQuery += `, geolocalizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, POINT(?, ?))`;
                insertParams.push(cliente.longitud, cliente.latitud); // POINT(longitud, latitud)
            } else {
                insertQuery += `) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            }

            await connection.execute(insertQuery, insertParams);
            totalInsertados++;
        }

        await connection.commit();
        
        // ✅ Devolver una estructura detallada con `resultados`
        res.json({
            message: `Sincronización completa exitosa. ${totalInsertados} clientes insertados.`,
            resultados: {
                creados: totalInsertados,
                actualizados: 0, // No hay actualizaciones en una sincronización completa
                errores: []      // No hubo errores si llegamos aquí
            }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización completa de clientes:", error);
        res.status(500).json({ 
            error: 'Error interno del servidor durante la sincronización.',
            resultados: {
                creados: 0,
                actualizados: 0,
                errores: [{ mensaje: error.message }] // Devolver error en la misma estructura
            }
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
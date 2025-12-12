// BackEnd/routes/actualizaciones/api-localidades.js
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

/**
 * @route   GET /api/actualizaciones/api-localidades
 * @desc    Obtener todas las localidades para sincronización
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                IdLocalidad AS id_localidad,
                Nombre AS nombre,
                IdProvincia AS id_provincia
            FROM Localidades
            ORDER BY Nombre
        `;
        const [localidades] = await db.execute(query);
        res.json(localidades);
    } catch (error) {
        console.error("Error al obtener localidades:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/**
 * @route   GET /api/actualizaciones/api-localidades/:id
 * @desc    Obtener una localidad por ID
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                IdLocalidad AS id_localidad,
                Nombre AS nombre,
                IdProvincia AS id_provincia
            FROM Localidades
            WHERE IdLocalidad = ?
        `;
        const [localidad] = await db.execute(query, [id]);
        
        if (localidad.length > 0) {
            res.json(localidad[0]);
        } else {
            res.status(404).json({ error: 'Localidad no encontrada.' });
        }
    } catch (error) {
        console.error(`Error al obtener localidad con ID ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al obtener la localidad.' });
    }
});

/**
 * @route   PUT /api/actualizaciones/api-localidades/batch
 * @desc    Sincronizar localidades (actualizar/insertar)
 */
router.put('/batch', async (req, res) => {
    const { localidades } = req.body;

    if (!Array.isArray(localidades) || localidades.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de localidades.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const resultados = { creados: 0, actualizados: 0, errores: [] };

        for (const localidad of localidades) {
            try {
                if (localidad.id_localidad == null || localidad.nombre == null || localidad.id_provincia == null) {
                    throw new Error('Faltan campos requeridos: id_localidad, nombre, id_provincia');
                }

                const [existing] = await connection.execute(
                    'SELECT IdLocalidad FROM Localidades WHERE IdLocalidad = ?',
                    [localidad.id_localidad]
                );

                if (existing.length > 0) {
                    const [updateResult] = await connection.execute(
                        'UPDATE Localidades SET Nombre = ?, IdProvincia = ? WHERE IdLocalidad = ?',
                        [localidad.nombre, localidad.id_provincia, localidad.id_localidad]
                    );
                    resultados.actualizados += updateResult.affectedRows;
                } else {
                    await connection.execute(
                        'INSERT INTO Localidades (IdLocalidad, Nombre, IdProvincia) VALUES (?, ?, ?)',
                        [localidad.id_localidad, localidad.nombre, localidad.id_provincia]
                    );
                    resultados.creados += 1;
                }
            } catch (error) {
                console.error(`Error procesando localidad ID ${localidad.id_localidad}:`, error);
                resultados.errores.push({
                    id_localidad: localidad.id_localidad,
                    error: error.message
                });
            }
        }

        await connection.commit();
        res.json({ message: 'Sincronización completada.', resultados });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización de localidades:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Variable global para controlar si ya se borró la tabla en esta ejecución
let tablaBorradaEnEstaEjecucion = false;

/**
 * @route   POST /api/actualizaciones/api-localidades/sync
 * @desc    Sincronizar completamente la tabla Localidades (eliminar y recrear)
 * @access  Público (⚠️ En producción, proteger)
 * @note    Este endpoint acepta lotes. Borra TODO solo una vez por ejecución.
 */
router.post('/sync', async (req, res) => {
    const { localidades } = req.body;

    if (!Array.isArray(localidades) || localidades.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de localidades para sincronizar.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Solo borrar una vez por ejecución del servidor
        if (!tablaBorradaEnEstaEjecucion) {
            console.log('[SYNC] Borrando todos los registros existentes (primera vez en esta ejecución)...');
            await connection.execute('DELETE FROM Localidades');
            tablaBorradaEnEstaEjecucion = true; // Marcar como borrada
            console.log('[SYNC] Registros eliminados.');
        } else {
            console.log('[SYNC] Ya se borró la tabla en esta ejecución. Saltando borrado.');
        }

        // 2. Insertar todos los registros del lote actual
        let totalInsertados = 0;
        for (const localidad of localidades) {
            // Validar campos requeridos
            if (localidad.id_localidad == null || localidad.nombre == null || localidad.id_provincia == null) {
                throw new Error('Faltan campos requeridos: id_localidad, nombre, id_provincia');
            }

            await connection.execute(
                'INSERT INTO Localidades (IdLocalidad, Nombre, IdProvincia) VALUES (?, ?, ?)',
                [localidad.id_localidad, localidad.nombre, localidad.id_provincia]
            );
            totalInsertados++;
        }

        await connection.commit();
        
        // ✅ Devolver una estructura detallada con `resultados`
        res.json({
            message: `Sincronización completa exitosa. ${totalInsertados} localidades insertadas.`,
            resultados: {
                creados: totalInsertados,
                actualizados: 0, // No hay actualizaciones en una sincronización completa
                errores: []      // No hubo errores si llegamos aquí
            }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización completa de localidades:", error);
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
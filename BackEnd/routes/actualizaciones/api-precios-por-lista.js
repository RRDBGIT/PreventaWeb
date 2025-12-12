// BackEnd/routes/actualizaciones/api-precios-por-lista.js
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

/**
 * @route   GET /api/actualizaciones/api-precios-por-lista
 * @desc    Obtener todos los precios por lista para sincronización
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                IdPrecio AS id_precio,
                IdProducto AS id_producto,
                IdLista AS id_lista,
                Precio AS precio
            FROM PreciosPorLista
            ORDER BY IdPrecio
        `;
        const [precios] = await db.execute(query);
        res.json(precios);
    } catch (error) {
        console.error("Error al obtener precios por lista:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/**
 * @route   PUT /api/actualizaciones/api-precios-por-lista/batch
 * @desc    Sincronizar precios por lista (actualizar/insertar)
 */
router.put('/batch', async (req, res) => {
    const { preciosporlista } = req.body;

    if (!Array.isArray(preciosporlista) || preciosporlista.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de precios por lista.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const resultados = { creados: 0, actualizados: 0, errores: [] };

        for (const precio of preciosporlista) {
            try {
                if (precio.id_precio == null || precio.id_producto == null || precio.id_lista == null || precio.precio == null) {
                    throw new Error('Faltan campos requeridos: id_precio, id_producto, id_lista, precio');
                }

                const [existing] = await connection.execute(
                    'SELECT IdPrecio FROM PreciosPorLista WHERE IdPrecio = ?',
                    [precio.id_precio]
                );

                if (existing.length > 0) {
                    const [updateResult] = await connection.execute(
                        'UPDATE PreciosPorLista SET IdProducto = ?, IdLista = ?, Precio = ? WHERE IdPrecio = ?',
                        [precio.id_producto, precio.id_lista, precio.precio, precio.id_precio]
                    );
                    resultados.actualizados += updateResult.affectedRows;
                } else {
                    await connection.execute(
                        'INSERT INTO PreciosPorLista (IdPrecio, IdProducto, IdLista, Precio) VALUES (?, ?, ?, ?)',
                        [precio.id_precio, precio.id_producto, precio.id_lista, precio.precio]
                    );
                    resultados.creados += 1;
                }
            } catch (error) {
                console.error(`Error procesando precio ID ${precio.id_precio}:`, error);
                resultados.errores.push({
                    id_precio: precio.id_precio,
                    error: error.message
                });
            }
        }

        await connection.commit();
        res.json({ message: 'Sincronización completada.', resultados });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización de precios por lista:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Variable global para controlar si ya se borró la tabla en esta ejecución
let tablaBorradaEnEstaEjecucion = false;

/**
 * @route   POST /api/actualizaciones/api-precios-por-lista/sync
 * @desc    Sincronizar completamente la tabla PreciosPorLista (eliminar y recrear)
 * @warning Este endpoint BORRA todos los datos existentes antes de insertar los nuevos.
 */
router.post('/sync', async (req, res) => {
    const { preciosporlista } = req.body;

    if (!Array.isArray(preciosporlista) || preciosporlista.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de precios por lista para sincronizar.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Solo borrar una vez por ejecución del servidor
        if (!tablaBorradaEnEstaEjecucion) {
            console.log('[SYNC] Borrando todos los registros existentes de PreciosPorLista (primera vez en esta ejecución)...');
            await connection.execute('DELETE FROM PreciosPorLista');
            tablaBorradaEnEstaEjecucion = true; // Marcar como borrada
            console.log('[SYNC] Registros de PreciosPorLista eliminados.');
        } else {
            console.log('[SYNC] Ya se borró la tabla PreciosPorLista en esta ejecución. Saltando borrado.');
        }

        // 2. Insertar todos los nuevos registros
        let totalInsertados = 0;
        for (const precio of preciosporlista) {
            // Validar campos requeridos
            if (precio.id_precio == null || precio.id_producto == null || precio.id_lista == null || precio.precio == null) {
                throw new Error('Faltan campos requeridos en un registro: id_precio, id_producto, id_lista, precio');
            }

            await connection.execute(
                'INSERT INTO PreciosPorLista (IdPrecio, IdProducto, IdLista, Precio) VALUES (?, ?, ?, ?)',
                [precio.id_precio, precio.id_producto, precio.id_lista, precio.precio]
            );
            totalInsertados++;
        }

        await connection.commit();
        
        // ✅ Devolver una estructura detallada con `resultados`
        res.json({
            message: `Sincronización completa exitosa. ${totalInsertados} precios por lista insertados.`,
            resultados: {
                creados: totalInsertados,
                actualizados: 0, // No hay actualizaciones en una sincronización completa
                errores: []      // No hubo errores si llegamos aquí
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error en sincronización completa de precios por lista:", error);
        res.status(500).json({ 
            error: 'Error interno del servidor durante la sincronización.',
            resultados: {
                creados: 0,
                actualizados: 0,
                errores: [{ mensaje: error.message }] // Devolver error en la misma estructura
            }
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
// BackEnd/routes/actualizaciones/api-productos.js
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

/**
 * @route   GET /api/actualizaciones/api-productos
 * @desc    Obtener todos los productos para sincronización
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                IdProducto AS id_producto,
                Codigo AS codigo,
                Descripcion AS descripcion,
                Activo AS activo
            FROM Productos
            ORDER BY Codigo
        `;
        const [productos] = await db.execute(query);
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/**
 * @route   PUT /api/actualizaciones/api-productos/batch
 * @desc    Sincronizar productos (actualizar/insertar)
 */
router.put('/batch', async (req, res) => {
    const { productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de productos.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const resultados = { creados: 0, actualizados: 0, errores: [] };

        for (const producto of productos) {
            try {
                if (producto.id_producto == null || producto.codigo == null || producto.descripcion == null) {
                    throw new Error('Faltan campos requeridos: id_producto, codigo, descripcion');
                }

                const [existing] = await connection.execute(
                    'SELECT IdProducto FROM Productos WHERE IdProducto = ?',
                    [producto.id_producto]
                );

                if (existing.length > 0) {
                    const [updateResult] = await connection.execute(
                        'UPDATE Productos SET Codigo = ?, Descripcion = ?, Activo = ? WHERE IdProducto = ?',
                        [producto.codigo, producto.descripcion, producto.activo || 1, producto.id_producto]
                    );
                    resultados.actualizados += updateResult.affectedRows;
                } else {
                    await connection.execute(
                        'INSERT INTO Productos (IdProducto, Codigo, Descripcion, Activo) VALUES (?, ?, ?, ?)',
                        [producto.id_producto, producto.codigo, producto.descripcion, producto.activo || 1]
                    );
                    resultados.creados += 1;
                }
            } catch (error) {
                console.error(`Error procesando producto ID ${producto.id_producto}:`, error);
                resultados.errores.push({
                    id_producto: producto.id_producto,
                    error: error.message
                });
            }
        }

        await connection.commit();
        res.json({ message: 'Sincronización completada.', resultados });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización de productos:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Variable global para controlar si ya se borró la tabla en esta ejecución
let tablaBorradaEnEstaEjecucion = false;

/**
 * @route   POST /api/actualizaciones/api-productos/sync
 * @desc    Sincronizar completamente la tabla Productos (eliminar y recrear)
 * @warning Este endpoint BORRA todos los datos existentes antes de insertar los nuevos.
 */
router.post('/sync', async (req, res) => {
    const { productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de productos para sincronizar.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Solo borrar una vez por ejecución del servidor
        if (!tablaBorradaEnEstaEjecucion) {
            console.log('[SYNC] Borrando todos los registros existentes de Productos (primera vez en esta ejecución)...');
            await connection.execute('DELETE FROM Productos');
            tablaBorradaEnEstaEjecucion = true; // Marcar como borrada
            console.log('[SYNC] Registros de Productos eliminados.');
        } else {
            console.log('[SYNC] Ya se borró la tabla Productos en esta ejecución. Saltando borrado.');
        }

        // 2. Insertar todos los nuevos registros
        let totalInsertados = 0;
        for (const producto of productos) {
            // Validar campos requeridos
            if (producto.id_producto == null || producto.codigo == null || producto.descripcion == null) {
                throw new Error('Faltan campos requeridos en un registro: id_producto, codigo, descripcion');
            }

            await connection.execute(
                'INSERT INTO Productos (IdProducto, Codigo, Descripcion, Activo) VALUES (?, ?, ?, ?)',
                [producto.id_producto, producto.codigo, producto.descripcion, producto.activo || 1]
            );
            totalInsertados++;
        }

        await connection.commit();
        
        // ✅ Devolver una estructura detallada con `resultados`
        res.json({
            message: `Sincronización completa exitosa. ${totalInsertados} productos insertados.`,
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
        console.error("Error en sincronización completa de productos:", error);
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
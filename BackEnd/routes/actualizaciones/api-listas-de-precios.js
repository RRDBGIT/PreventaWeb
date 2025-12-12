// BackEnd/routes/actualizaciones/api-listas-de-precios.js
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

/**
 * @route   GET /api/actualizaciones/api-listas-de-precios
 * @desc    Obtener todas las listas de precios para sincronización
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                IdLista AS id_lista,
                Nombre AS nombre
            FROM ListasDePrecios
            ORDER BY Nombre
        `;
        const [listas] = await db.execute(query);
        res.json(listas);
    } catch (error) {
        console.error("Error al obtener listas de precios:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/**
 * @route   PUT /api/actualizaciones/api-listas-de-precios/batch
 * @desc    Sincronizar listas de precios (actualizar/insertar)
 */
router.put('/batch', async (req, res) => {
    const { listasdeprecios } = req.body;

    if (!Array.isArray(listasdeprecios) || listasdeprecios.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de listas de precios.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const resultados = { creados: 0, actualizados: 0, errores: [] };

        for (const lista of listasdeprecios) {
            try {
                if (lista.id_lista == null || lista.nombre == null) {
                    throw new Error('Faltan campos requeridos: id_lista, nombre');
                }

                const [existing] = await connection.execute(
                    'SELECT IdLista FROM ListasDePrecios WHERE IdLista = ?',
                    [lista.id_lista]
                );

                if (existing.length > 0) {
                    const [updateResult] = await connection.execute(
                        'UPDATE ListasDePrecios SET Nombre = ? WHERE IdLista = ?',
                        [lista.nombre, lista.id_lista]
                    );
                    resultados.actualizados += updateResult.affectedRows;
                } else {
                    await connection.execute(
                        'INSERT INTO ListasDePrecios (IdLista, Nombre) VALUES (?, ?)',
                        [lista.id_lista, lista.nombre]
                    );
                    resultados.creados += 1;
                }
            } catch (error) {
                console.error(`Error procesando lista de precios ID ${lista.id_lista}:`, error);
                resultados.errores.push({
                    id_lista: lista.id_lista,
                    error: error.message
                });
            }
        }

        await connection.commit();
        res.json({ message: 'Sincronización completada.', resultados });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización de listas de precios:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
}); // ✅ LLAVE DE CIERRE AGREGADA AQUÍ

// Variable global para controlar si ya se borró la tabla en esta ejecución
let tablaBorradaEnEstaEjecucion = false;

/**
 * @route   POST /api/actualizaciones/api-listas-de-precios/sync
 * @desc    Sincronizar completamente la tabla ListasDePrecios (eliminar y recrear)
 * @warning Este endpoint BORRA todos los datos existentes antes de insertar los nuevos.
 * @note    Solo borra una vez por ejecución del servidor.
 */
router.post('/sync', async (req, res) => {
    const { listasdeprecios } = req.body;

    if (!Array.isArray(listasdeprecios) || listasdeprecios.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de listas de precios para sincronizar.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Solo borrar una vez por ejecución del servidor
        if (!tablaBorradaEnEstaEjecucion) {
            console.log('[SYNC] Borrando todos los registros existentes de ListasDePrecios (primera vez en esta ejecución)...');
            await connection.execute('DELETE FROM ListasDePrecios');
            tablaBorradaEnEstaEjecucion = true; // Marcar como borrada
            console.log('[SYNC] Registros de ListasDePrecios eliminados.');
        } else {
            console.log('[SYNC] Ya se borró la tabla ListasDePrecios en esta ejecución. Saltando borrado.');
        }

        // 2. Insertar todos los nuevos registros
        let totalInsertados = 0;
        for (const lista of listasdeprecios) {
            // Validar campos requeridos
            if (lista.id_lista == null || lista.nombre == null) {
                throw new Error('Faltan campos requeridos en un registro: id_lista, nombre');
            }

            await connection.execute(
                'INSERT INTO ListasDePrecios (IdLista, Nombre) VALUES (?, ?)',
                [lista.id_lista, lista.nombre]
            );
            totalInsertados++;
        }

        await connection.commit();
        
        // ✅ Devolver una estructura detallada con `resultados`
        res.json({
            message: `Sincronización completa exitosa. ${totalInsertados} listas de precios insertadas.`,
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
        console.error("Error en sincronización completa de listas de precios:", error);
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
// BackEnd/routes/actualizaciones/api-usuarios.js
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

/**
 * @route   GET /api/actualizaciones/api-usuarios
 * @desc    Obtener todos los usuarios para sincronización
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                IdUsuario AS id_usuario,
                Usuario AS usuario,
                Password AS password,
                NombreCompleto AS nombre_completo,
                Rol AS rol,
                Activo AS activo
            FROM Usuarios
            ORDER BY Usuario
        `;
        const [usuarios] = await db.execute(query);
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/**
 * @route   PUT /api/actualizaciones/api-usuarios/batch
 * @desc    Sincronizar usuarios (actualizar/insertar)
 */
router.put('/batch', async (req, res) => {
    const { usuarios } = req.body;

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de usuarios.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const resultados = { creados: 0, actualizados: 0, errores: [] };

        for (const usuario of usuarios) {
            try {
                if (usuario.id_usuario == null || usuario.usuario == null || usuario.password == null) {
                    throw new Error('Faltan campos requeridos: id_usuario, usuario, password');
                }

                const [existing] = await connection.execute(
                    'SELECT IdUsuario FROM Usuarios WHERE IdUsuario = ?',
                    [usuario.id_usuario]
                );

                if (existing.length > 0) {
                    const [updateResult] = await connection.execute(
                        'UPDATE Usuarios SET Usuario = ?, Password = ?, NombreCompleto = ?, Rol = ?, Activo = ? WHERE IdUsuario = ?',
                        [
                            usuario.usuario,
                            usuario.password,
                            usuario.nombre_completo || null,
                            usuario.rol || 'vendedor',
                            usuario.activo !== undefined ? usuario.activo : 1,
                            usuario.id_usuario
                        ]
                    );
                    resultados.actualizados += updateResult.affectedRows;
                } else {
                    await connection.execute(
                        'INSERT INTO Usuarios (IdUsuario, Usuario, Password, NombreCompleto, Rol, Activo) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            usuario.id_usuario,
                            usuario.usuario,
                            usuario.password,
                            usuario.nombre_completo || null,
                            usuario.rol || 'vendedor',
                            usuario.activo !== undefined ? usuario.activo : 1
                        ]
                    );
                    resultados.creados += 1;
                }
            } catch (error) {
                console.error(`Error procesando usuario ID ${usuario.id_usuario}:`, error);
                resultados.errores.push({
                    id_usuario: usuario.id_usuario,
                    error: error.message
                });
            }
        }

        await connection.commit();
        res.json({ message: 'Sincronización completada.', resultados });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización de usuarios:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Variable global para controlar si ya se borró la tabla en esta ejecución
let tablaBorradaEnEstaEjecucion = false;

/**
 * @route   POST /api/actualizaciones/api-usuarios/sync
 * @desc    Sincronizar completamente la tabla Usuarios (eliminar y recrear)
 * @warning Este endpoint BORRA todos los datos existentes antes de insertar los nuevos.
 */
router.post('/sync', async (req, res) => {
    const { usuarios } = req.body;

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de usuarios para sincronizar.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Solo borrar una vez por ejecución del servidor
        if (!tablaBorradaEnEstaEjecucion) {
            console.log('[SYNC] Borrando todos los registros existentes de Usuarios (primera vez en esta ejecución)...');
            await connection.execute('DELETE FROM Usuarios');
            tablaBorradaEnEstaEjecucion = true; // Marcar como borrada
            console.log('[SYNC] Registros de Usuarios eliminados.');
        } else {
            console.log('[SYNC] Ya se borró la tabla Usuarios en esta ejecución. Saltando borrado.');
        }

        // 2. Insertar todos los nuevos registros
        let totalInsertados = 0;
        for (const usuario of usuarios) {
            // Validar campos requeridos
            if (usuario.id_usuario == null || usuario.usuario == null || usuario.password == null) {
                throw new Error('Faltan campos requeridos en un registro: id_usuario, usuario, password');
            }

            await connection.execute(
                'INSERT INTO Usuarios (IdUsuario, Usuario, Password, NombreCompleto, Rol, Activo) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    usuario.id_usuario,
                    usuario.usuario,
                    usuario.password,
                    usuario.nombre_completo || null,
                    usuario.rol || 'vendedor',
                    usuario.activo !== undefined ? usuario.activo : 1
                ]
            );
            totalInsertados++;
        }

        await connection.commit();
        
        // ✅ Devolver una estructura detallada con `resultados`
        res.json({
            message: `Sincronización completa exitosa. ${totalInsertados} usuarios insertados.`,
            resultados: {
                creados: totalInsertados,
                actualizados: 0, // No hay actualizaciones en una sincronización completa
                errores: []      // No hubo errores si llegamos aquí
            }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en sincronización completa de usuarios:", error);
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
// C:\PreventaWeb\BackEnd\controllers\pedidoController.js

const db = require('../models/db');

// ✅ CORREGIDO: Generar número de pedido buscando el MÁXIMO correlativo existente
// ✅ Esto evita duplicados cuando se eliminan pedidos
const generarNumeroPedido = async (idVendedor) => {
    try {
        // ✅ Usar CURDATE() de MySQL para evitar desfase de zona horaria
        // ✅ Buscar el máximo correlativo en lugar de contar pedidos
        const [result] = await db.execute(`
            SELECT 
                DATE_FORMAT(CURDATE(), '%y%m%d') AS fecha_corta,
                COALESCE(MAX(
                    CAST(SUBSTRING(NumeroPedido, -3) AS UNSIGNED)
                ), 0) + 1 AS siguiente
            FROM Pedidos
            WHERE IdVendedor = ? AND DATE(FechaPedido) = CURDATE()
        `, [idVendedor]);

        const { fecha_corta, siguiente } = result[0];
        const correlativo = String(siguiente).padStart(3, '0');
        const numeroPedido = `${idVendedor}-${fecha_corta}${correlativo}`;

        console.log("✅ Número de pedido generado:", numeroPedido);
        return numeroPedido;
    } catch (error) {
        console.error("❌ Error al generar número de pedido:", error.message);
        throw error;
    }
};

exports.crearPedido = async (req, res) => {
    const {
        idCliente,
        fechaVencimiento,
        idFormaPago,
        idListaPrecios,
        total,
        carrito,
        idVendedor,
        fechaEntrega
    } = req.body;

    console.log("📥 Datos recibidos en /api/pedidos:", req.body);

    if (!idCliente || !carrito || carrito.length === 0 || !idVendedor) {
        console.log("❌ Datos faltantes:", { idCliente, carritoLength: carrito?.length, idVendedor });
        return res.status(400).json({ error: 'Faltan datos para crear el pedido (incluyendo idVendedor)' });
    }

    // ✅ Generar número de pedido con el nuevo formato (string)
    const numeroPedido = await generarNumeroPedido(idVendedor);

    try {
        await db.execute('START TRANSACTION');

        // ✅ CORREGIDO: FinDelDia SIEMPRE es NULL al crear un pedido
        // Solo se setea FinDelDia cuando se ejecuta la función cerrarDia
        const query = `
            INSERT INTO Pedidos (
                NumeroPedido, IdCliente, FechaVencimiento, FechaEntrega,
                IdFormaPago, IdListaPrecios, Total, Estado, IdVendedor, FinDelDia
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMADO', ?, NULL)
        `;

        const params = [
            numeroPedido,
            idCliente,
            fechaVencimiento,
            fechaEntrega || null,
            idFormaPago || null,
            idListaPrecios || null,
            total,
            idVendedor
        ];

        const [pedidoResult] = await db.execute(query, params);

        const idPedido = pedidoResult.insertId;

        // 2. Insertar detalles del pedido
        for (let i = 0; i < carrito.length; i++) {
            const item = carrito[i];
            await db.execute(`
                INSERT INTO DetallePedidos (
                    IdDetalle,
                    NumeroPedido,
                    IdProducto,
                    IdLista,
                    Cantidad,
                    PrecioUnitario,
                    Importe
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                i + 1,
                numeroPedido,
                item.producto.IdProducto,
                item.idListaPrecios || null,
                item.cantidad,
                item.precioUnitario,
                item.importe
            ]);
        }

        await db.execute('COMMIT');

        // 3. Obtener datos del pedido creado (cabecera)
        const [pedidoCabecera] = await db.execute(`
            SELECT 
                p.IdPedido AS id_pedido,
                p.NumeroPedido AS numero_pedido,
                p.FechaPedido AS fecha_pedido,
                p.FechaEntrega AS fecha_entrega,
                p.FechaVencimiento AS fecha_vencimiento,
                p.Total AS total,
                p.Estado AS estado,
                p.FinDelDia AS fin_del_dia,
                p.IdListaPrecios AS id_lista_precios,
                c.IdCliente AS id_cliente,
                c.NumeroCliente AS numero_cliente,
                c.RazonSocial AS razon_social_cliente,
                u.IdUsuario AS id_vendedor,
                u.Usuario AS nombre_vendedor,
                fp.Descripcion AS forma_pago,
                lp.Nombre AS lista_precios
            FROM Pedidos p
            INNER JOIN Clientes c ON p.IdCliente = c.IdCliente
            LEFT JOIN Usuarios u ON p.IdVendedor = u.IdUsuario
            LEFT JOIN FormasDePago fp ON p.IdFormaPago = fp.IdPago
            LEFT JOIN ListasDePrecios lp ON p.IdListaPrecios = lp.IdLista
            WHERE p.IdPedido = ?
        `, [idPedido]);

        // 4. Obtener items del pedido creado (detalles)
        const [pedidoDetalles] = await db.execute(`
            SELECT 
                dp.IdProducto AS producto_id,
                pr.Codigo AS producto_codigo,
                pr.Descripcion AS producto_descripcion,
                dp.Cantidad AS cantidad,
                dp.PrecioUnitario AS precio_unitario,
                dp.Importe AS importe,
                dp.IdLista AS IdLista
            FROM DetallePedidos dp
            INNER JOIN Productos pr ON dp.IdProducto = pr.IdProducto
            WHERE dp.NumeroPedido = ?
            ORDER BY dp.IdDetalle
        `, [numeroPedido]);

        // 5. Combinar cabecera y detalles
        const pedidoCompleto = {
            ...pedidoCabecera[0],
            carrito_items: pedidoDetalles.map(detalle => ({
                producto: {
                    IdProducto: detalle.producto_id,
                    Codigo: detalle.producto_codigo,
                    Descripcion: detalle.producto_descripcion
                },
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precio_unitario,
                importe: detalle.importe,
                IdLista: detalle.IdLista
            }))
        };

        console.log("✅ Pedido creado con número:", pedidoCompleto.numero_pedido, "- FinDelDia: NULL");
        res.status(201).json(pedidoCompleto);

    } catch (error) {
        await db.execute('ROLLBACK');
        console.error("❌ ERROR al crear pedido:", error.message);
        res.status(500).json({ error: 'Error interno al guardar el pedido' });
    }
};

// ✅ Obtener pedidos por vendedor
exports.obtenerPedidosPorVendedor = async (req, res) => {
    const { idVendedor } = req.params;

    try {
        const [pedidos] = await db.execute(`
            SELECT 
                p.IdPedido AS id_pedido,
                p.NumeroPedido AS numero_pedido,
                p.FechaPedido AS fecha_pedido,
                p.FechaVencimiento AS fecha_vencimiento,
                p.Total AS total,
                p.Estado AS estado,
                c.RazonSocial AS razon_social_cliente,
                u.Usuario AS nombre_vendedor
            FROM Pedidos p
            INNER JOIN Clientes c ON p.IdCliente = c.IdCliente
            LEFT JOIN Usuarios u ON p.IdVendedor = u.IdUsuario
            WHERE p.IdVendedor = ? OR p.IdVendedor IS NULL
            ORDER BY p.FechaPedido DESC
        `, [idVendedor]);

        res.json(pedidos);
    } catch (error) {
        console.error("❌ ERROR al obtener pedidos:", error.message);
        res.status(500).json({ error: 'Error al cargar pedidos' });
    }
};

// ✅ Cerrar el día del vendedor (ÚNICA función que setea FinDelDia)
exports.cerrarDia = async (req, res) => {
    const { idVendedor } = req.body;

    if (!idVendedor || isNaN(idVendedor)) {
        return res.status(400).json({ error: 'ID de vendedor inválido' });
    }

    try {
        // 1. Verificar que el vendedor exista
        const [vendedores] = await db.execute(
            `SELECT IdUsuario FROM Usuarios WHERE IdUsuario = ?`,
            [idVendedor]
        );

        if (vendedores.length === 0) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        // 2. Marcar SOLO los pedidos del DÍA ACTUAL que no tienen FinDelDia
        const [result] = await db.execute(
            `UPDATE Pedidos 
             SET FinDelDia = NOW() 
             WHERE IdVendedor = ? 
               AND FinDelDia IS NULL 
               AND DATE(FechaPedido) = CURDATE()`,
            [idVendedor]
        );

        console.log(`✅ Vendedor ${idVendedor} cerró el día. ${result.affectedRows} pedidos marcados.`);

        if (result.affectedRows === 0) {
            return res.json({ 
                success: true, 
                message: 'No hay pedidos pendientes del día de hoy para cerrar',
                pedidosMarcados: 0
            });
        }

        res.json({ 
            success: true, 
            message: 'Día cerrado correctamente',
            pedidosMarcados: result.affectedRows
        });

    } catch (error) {
        console.error('❌ Error en cerrarDia:', error);
        res.status(500).json({ error: 'Error al cerrar el día' });
    }
};

// ✅ Obtener resumen del cierre diario (INCLUYE todos los pedidos del día)
exports.obtenerResumenCierre = async (req, res) => {
    const { idVendedor } = req.params;

    if (!idVendedor || isNaN(idVendedor)) {
        return res.status(400).json({ error: 'ID de vendedor inválido' });
    }

    try {
        // 1. Verificar que el vendedor exista y esté activo
        const [vendedores] = await db.execute(
            `SELECT IdUsuario, Usuario FROM Usuarios WHERE IdUsuario = ? AND Activo = 1`,
            [idVendedor]
        );

        if (vendedores.length === 0) {
            return res.status(404).json({ error: 'Vendedor no encontrado o inactivo' });
        }

        const { Usuario: nombreVendedor } = vendedores[0];

        // 2. Calcular métricas del día actual: total pedidos, clientes únicos y total facturado
        const [result] = await db.execute(`
            SELECT 
                COUNT(*) AS totalPedidos,
                COUNT(DISTINCT IdCliente) AS totalClientes,
                COALESCE(SUM(Total), 0) AS totalFacturado
            FROM Pedidos
            WHERE IdVendedor = ?
              AND DATE(FechaPedido) = CURDATE()
              AND Estado = 'CONFIRMADO'
        `, [idVendedor]);

        const { totalPedidos, totalClientes, totalFacturado } = result[0];

        // 3. Enviar resumen al frontend
        res.json({
            nombreVendedor,
            totalPedidos: Number(totalPedidos),
            totalClientesAtendidos: Number(totalClientes),
            totalFacturado: parseFloat(totalFacturado).toFixed(2)
        });

    } catch (error) {
        console.error('❌ Error en obtenerResumenCierre:', error);
        res.status(500).json({ error: 'Error al cargar el resumen del cierre' });
    }
};

// ✅ NUEVA FUNCIÓN: Obtener resumen de pedidos de un día específico
// ✅ CORREGIDO: Ahora incluye id_lista_precios para el editor
exports.obtenerResumenDia = async (req, res) => {
    const { fecha, idVendedor } = req.query;

    if (!fecha || !idVendedor) {
        return res.status(400).json({ error: 'Fecha e ID de vendedor son requeridos' });
    }

    try {
        console.log(`📊 Obteniendo resumen del día ${fecha} para vendedor ${idVendedor}`);

        // 1. Obtener pedidos del día con información completa
        const [pedidos] = await db.execute(`
            SELECT 
                p.IdPedido AS id_pedido,
                p.NumeroPedido AS numero_pedido,
                p.IdCliente AS id_cliente,
                c.RazonSocial AS razon_social_cliente,
                p.FechaPedido AS fecha_pedido,
                p.FechaEntrega AS fecha_entrega,
                p.FechaVencimiento AS fecha_vencimiento,
                p.Total AS total,
                p.Estado AS estado,
                p.IdListaPrecios AS id_lista_precios,
                fp.Descripcion AS forma_pago,
                lp.Nombre AS lista_precios,
                COUNT(dp.IdDetalle) AS cantidad_items,
                p.FinDelDia AS fin_del_dia
            FROM Pedidos p
            INNER JOIN Clientes c ON p.IdCliente = c.IdCliente
            LEFT JOIN FormasDePago fp ON p.IdFormaPago = fp.IdPago
            LEFT JOIN ListasDePrecios lp ON p.IdListaPrecios = lp.IdLista
            LEFT JOIN DetallePedidos dp ON p.NumeroPedido = dp.NumeroPedido
            WHERE DATE(p.FechaPedido) = ? 
              AND p.IdVendedor = ?
              AND p.Estado = 'CONFIRMADO'
            GROUP BY p.IdPedido
            ORDER BY p.FechaPedido DESC
        `, [fecha, idVendedor]);

        console.log(`✅ ${pedidos.length} pedidos encontrados para la fecha ${fecha}`);

        // 2. Obtener items de cada pedido
        for (const pedido of pedidos) {
            const [items] = await db.execute(`
                SELECT 
                    dp.IdDetalle AS id_detalle,
                    dp.IdProducto AS id_producto,
                    pr.Codigo AS codigo_producto,
                    pr.Descripcion AS descripcion_producto,
                    dp.Cantidad AS cantidad,
                    dp.PrecioUnitario AS precio_unitario,
                    dp.Importe AS importe,
                    dp.IdLista AS id_lista
                FROM DetallePedidos dp
                INNER JOIN Productos pr ON dp.IdProducto = pr.IdProducto
                WHERE dp.NumeroPedido = ?
                ORDER BY dp.IdDetalle
            `, [pedido.numero_pedido]);

            pedido.items = items;
        }

        res.json({
            success: true,
            fecha,
            idVendedor,
            totalPedidos: pedidos.length,
            pedidos
        });

    } catch (error) {
        console.error('❌ Error en obtenerResumenDia:', error);
        res.status(500).json({ error: 'Error al obtener el resumen del día' });
    }
};

// ✅ FUNCIÓN MEJORADA: Editar pedido completo (cabecera + items)
// ⚠️ REGLA: Solo permite editar pedidos NO cerrados (FinDelDia IS NULL)
// ✅ CORREGIDO: Ahora incluye id_lista_precios en la respuesta
exports.editarPedido = async (req, res) => {
    const { id } = req.params;
    const { 
        fecha_entrega, 
        fecha_vencimiento,
        items,
        total
    } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID de pedido requerido' });
    }

    try {
        console.log(`✏️ Intentando editar pedido ${id}`);

        // 1. Obtener datos actuales del pedido Y verificar si está cerrado
        const [pedidoActual] = await db.execute(`
            SELECT 
                IdPedido,
                NumeroPedido, 
                IdCliente, 
                IdVendedor, 
                Total,
                FinDelDia,
                IdListaPrecios
            FROM Pedidos
            WHERE IdPedido = ?
        `, [id]);

        if (pedidoActual.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // ✅ VALIDACIÓN: Verificar si el pedido está cerrado
        if (pedidoActual[0].FinDelDia !== null) {
            const fechaCierre = new Date(pedidoActual[0].FinDelDia).toLocaleString('es-AR');
            console.log(`⚠️ Intento de editar pedido cerrado ${id}. Cerrado el: ${fechaCierre}`);
            return res.status(403).json({ 
                error: 'No se puede editar un pedido que ya fue cerrado',
                fechaCierre: fechaCierre,
                mensaje: 'Este pedido ya fue cerrado el día ' + fechaCierre + ' y no puede ser modificado'
            });
        }

        const numeroPedido = pedidoActual[0].NumeroPedido;
        const idListaPrecios = pedidoActual[0].IdListaPrecios;

        // 2. Iniciar transacción
        await db.execute('START TRANSACTION');

        // 3. Actualizar cabecera (fechas y total)
        let queryCabecera = 'UPDATE Pedidos SET ';
        const paramsCabecera = [];

        if (fecha_entrega) {
            queryCabecera += 'FechaEntrega = ?, ';
            paramsCabecera.push(fecha_entrega);
        }

        if (fecha_vencimiento) {
            queryCabecera += 'FechaVencimiento = ?, ';
            paramsCabecera.push(fecha_vencimiento);
        }

        if (total !== undefined) {
            queryCabecera += 'Total = ?, ';
            paramsCabecera.push(total);
        }

        // Si hay campos para actualizar
        if (paramsCabecera.length > 0) {
            queryCabecera = queryCabecera.slice(0, -2);
            queryCabecera += ' WHERE IdPedido = ?';
            paramsCabecera.push(id);

            await db.execute(queryCabecera, paramsCabecera);
            console.log(`✅ Cabecera del pedido ${id} actualizada`);
        }

        // 4. Si se proporcionaron items, actualizarlos
        if (items && Array.isArray(items)) {
            // 4.1. Eliminar todos los items actuales
            await db.execute(`
                DELETE FROM DetallePedidos 
                WHERE NumeroPedido = ?
            `, [numeroPedido]);

            console.log(`🗑️ Items antiguos eliminados para pedido ${numeroPedido}`);

            // 4.2. Insertar los nuevos items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                await db.execute(`
                    INSERT INTO DetallePedidos (
                        IdDetalle,
                        NumeroPedido,
                        IdProducto,
                        IdLista,
                        Cantidad,
                        PrecioUnitario,
                        Importe
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    i + 1,
                    numeroPedido,
                    item.id_producto || item.IdProducto,
                    item.id_lista || item.IdLista || idListaPrecios || null,
                    item.cantidad,
                    item.precio_unitario || item.precioUnitario,
                    item.importe
                ]);
            }

            console.log(`✅ ${items.length} nuevos items insertados para pedido ${numeroPedido}`);
        }

        // 5. Commit de la transacción
        await db.execute('COMMIT');
        console.log(`✅ Pedido ${id} actualizado completamente`);

        // 6. Obtener pedido actualizado completo
        const [pedidoActualizado] = await db.execute(`
            SELECT 
                p.IdPedido AS id_pedido,
                p.NumeroPedido AS numero_pedido,
                p.FechaPedido AS fecha_pedido,
                p.FechaEntrega AS fecha_entrega,
                p.FechaVencimiento AS fecha_vencimiento,
                p.Total AS total,
                p.Estado AS estado,
                p.IdListaPrecios AS id_lista_precios,
                c.RazonSocial AS razon_social_cliente,
                fp.Descripcion AS forma_pago,
                lp.Nombre AS lista_precios
            FROM Pedidos p
            INNER JOIN Clientes c ON p.IdCliente = c.IdCliente
            LEFT JOIN FormasDePago fp ON p.IdFormaPago = fp.IdPago
            LEFT JOIN ListasDePrecios lp ON p.IdListaPrecios = lp.IdLista
            WHERE p.IdPedido = ?
        `, [id]);

        // 7. Obtener items actualizados
        const [itemsActualizados] = await db.execute(`
            SELECT 
                dp.IdDetalle AS id_detalle,
                dp.IdProducto AS id_producto,
                pr.Codigo AS codigo_producto,
                pr.Descripcion AS descripcion_producto,
                dp.Cantidad AS cantidad,
                dp.PrecioUnitario AS precio_unitario,
                dp.Importe AS importe,
                dp.IdLista AS id_lista
            FROM DetallePedidos dp
            INNER JOIN Productos pr ON dp.IdProducto = pr.IdProducto
            WHERE dp.NumeroPedido = ?
            ORDER BY dp.IdDetalle
        `, [numeroPedido]);

        res.json({
            success: true,
            message: 'Pedido actualizado correctamente',
            pedido: {
                ...pedidoActualizado[0],
                items: itemsActualizados
            }
        });

    } catch (error) {
        await db.execute('ROLLBACK');
        console.error('❌ Error en editarPedido:', error);
        res.status(500).json({ error: 'Error al editar el pedido: ' + error.message });
    }
};

// ✅ NUEVA FUNCIÓN: Eliminar pedido
// ⚠️ REGLA: Solo permite eliminar pedidos NO cerrados (FinDelDia IS NULL)
exports.eliminarPedido = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de pedido requerido' });
    }

    try {
        console.log(`🗑️ Intentando eliminar pedido ${id}`);

        // 1. Obtener datos del pedido Y verificar si está cerrado
        const [pedidoActual] = await db.execute(`
            SELECT 
                IdPedido,
                NumeroPedido,
                FinDelDia
            FROM Pedidos
            WHERE IdPedido = ?
        `, [id]);

        if (pedidoActual.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // ✅ VALIDACIÓN: Verificar si el pedido está cerrado
        if (pedidoActual[0].FinDelDia !== null) {
            const fechaCierre = new Date(pedidoActual[0].FinDelDia).toLocaleString('es-AR');
            console.log(`⚠️ Intento de eliminar pedido cerrado ${id}. Cerrado el: ${fechaCierre}`);
            return res.status(403).json({ 
                error: 'No se puede eliminar un pedido que ya fue cerrado',
                fechaCierre: fechaCierre,
                mensaje: 'Este pedido ya fue cerrado el día ' + fechaCierre + ' y no puede ser eliminado'
            });
        }

        const numeroPedido = pedidoActual[0].NumeroPedido;

        // 2. Iniciar transacción
        await db.execute('START TRANSACTION');

        // 3. Eliminar primero los items (DetallePedidos)
        const [resultItems] = await db.execute(`
            DELETE FROM DetallePedidos 
            WHERE NumeroPedido = ?
        `, [numeroPedido]);

        console.log(`🗑️ ${resultItems.affectedRows} items eliminados del pedido ${numeroPedido}`);

        // 4. Eliminar el pedido (Pedidos)
        const [resultPedido] = await db.execute(`
            DELETE FROM Pedidos 
            WHERE IdPedido = ?
        `, [id]);

        console.log(`✅ Pedido ${id} (${numeroPedido}) eliminado correctamente`);

        // 5. Commit de la transacción
        await db.execute('COMMIT');

        res.json({
            success: true,
            message: 'Pedido eliminado correctamente',
            numeroPedido: numeroPedido,
            itemsEliminados: resultItems.affectedRows
        });

    } catch (error) {
        await db.execute('ROLLBACK');
        console.error('❌ Error en eliminarPedido:', error);
        res.status(500).json({ error: 'Error al eliminar el pedido: ' + error.message });
    }
};
// C:\PreventaWeb\BackEnd\controllers\pedidoController.js

const db = require('../models/db');

// ✅ Generar número de pedido en formato: idVendedor-AAAMMDDNNN (100% sincronizado con MySQL)
const generarNumeroPedido = async (idVendedor) => {
    try {
        // ✅ Usar CURDATE() de MySQL para evitar desfase de zona horaria
        const [result] = await db.execute(`
            SELECT 
                DATE_FORMAT(CURDATE(), '%y%m%d') AS fecha_corta,
                COUNT(*) + 1 AS siguiente
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
        idVendedor
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

        // 1. Insertar cabecera del pedido
        const [pedidoResult] = await db.execute(`
            INSERT INTO Pedidos (
                NumeroPedido, IdCliente, FechaVencimiento, 
                IdFormaPago, IdListaPrecios, Total, Estado, IdVendedor
            ) VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMADO', ?)
        `, [
            numeroPedido,
            idCliente,
            fechaVencimiento,
            idFormaPago || null,
            idListaPrecios || null,
            total,
            idVendedor
        ]);

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
                p.FechaVencimiento AS fecha_vencimiento,
                p.Total AS total,
                p.Estado AS estado,
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

        console.log("✅ Pedido creado con número:", pedidoCompleto.numero_pedido);
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

// ✅ Cerrar el día del vendedor (solo pedidos del día actual sin FinDelDia)
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
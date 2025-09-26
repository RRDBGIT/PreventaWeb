const db = require('../models/db');

// Generar número de pedido único
const generarNumeroPedido = () => {
    return `PED-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

exports.crearPedido = async (req, res) => {
    const {
        idCliente,
        fechaVencimiento,
        idFormaPago,
        idListaPrecios,
        total,
        carrito, // ✅ Este es el array de productos
        idVendedor
    } = req.body;

    // ✅ Log para debuggear
    console.log("📥 Datos recibidos en /api/pedidos:", req.body);

    if (!idCliente || !carrito || carrito.length === 0) {
        console.log("❌ Datos faltantes:", { idCliente, carritoLength: carrito?.length });
        return res.status(400).json({ error: 'Faltan datos para crear el pedido' });
    }

    const numeroPedido = generarNumeroPedido();

    try {
        await db.execute('START TRANSACTION');

        // 1. ✅ Insertar cabecera del pedido
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
            idVendedor || null
        ]);

        const idPedido = pedidoResult.insertId;

        // 2. ✅ Insertar detalles del pedido
        for (const item of carrito) {
            await db.execute(`
                INSERT INTO DetallePedidos (
                    IdPedido, IdProducto, Cantidad, PrecioUnitario, Importe
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                idPedido,
                item.producto.IdProducto,
                item.cantidad,
                item.precioUnitario,
                item.importe
            ]);
        }

        await db.execute('COMMIT');

        // 3. ✅ Obtener datos del pedido creado (cabecera)
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

        // 4. ✅ Obtener items del pedido creado (detalles)
        const [pedidoDetalles] = await db.execute(`
            SELECT 
                dp.IdProducto AS producto_id,
                pr.Codigo AS producto_codigo,
                pr.Descripcion AS producto_descripcion,
                dp.Cantidad AS cantidad,
                dp.PrecioUnitario AS precio_unitario,
                dp.Importe AS importe
            FROM DetallePedidos dp
            INNER JOIN Productos pr ON dp.IdProducto = pr.IdProducto
            WHERE dp.IdPedido = ?
            ORDER BY dp.IdDetalle
        `, [idPedido]);

        // 5. ✅ Combinar cabecera y detalles en un solo objeto
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
                importe: detalle.importe
            }))
        };

        console.log("✅ Pedido creado con items:", pedidoCompleto.numero_pedido);
        res.status(201).json(pedidoCompleto);

    } catch (error) {
        await db.execute('ROLLBACK');
        console.error("❌ ERROR al crear pedido:", error.message);
        res.status(500).json({ error: 'Error interno al guardar el pedido' });
    }
};

// ✅ Nueva función: Obtener pedidos por vendedor
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
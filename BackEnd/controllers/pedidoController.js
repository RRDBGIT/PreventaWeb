const db = require('../models/db');

exports.crearPedido = async (req, res) => {
    const { IdCliente, FechaVencimiento, IdFormaPago, IdListaPrecios, Total, Detalle } = req.body;

    if (!IdCliente || !IdFormaPago || !IdListaPrecios || !Total || !Detalle || Detalle.length === 0) {
        return res.status(400).json({ msg: 'Faltan datos obligatorios' });
    }

    try {
        await db.execute('START TRANSACTION');

        const [result] = await db.execute(
            `INSERT INTO Pedidos (IdCliente, IdUsuario, FechaVencimiento, IdFormaPago, IdListaPrecios, Total, Estado) 
             VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
            [IdCliente, 1, FechaVencimiento, IdFormaPago, IdListaPrecios, Total] // IdUsuario temporal = 1
        );

        const idPedido = result.insertId;

        for (const item of Detalle) {
            await db.execute(
                `INSERT INTO DetallePedidos (IdPedido, IdProducto, Cantidad, PrecioUnitario, Importe) 
                 VALUES (?, ?, ?, ?, ?)`,
                [idPedido, item.IdProducto, item.Cantidad, item.PrecioUnitario, item.Importe]
            );
        }

        await db.execute('COMMIT');
        res.status(201).json({ msg: 'Pedido creado con éxito', id: idPedido });

    } catch (error) {
        await db.execute('ROLLBACK');
        console.error(error);
        res.status(500).json({ msg: 'Error al crear pedido', error: error.message });
    }
};
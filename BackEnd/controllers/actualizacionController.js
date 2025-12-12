// BackEnd/controllers/actualizacionController.js
const db = require('../models/db');

// Obtener todos los pedidos listos para sincronizar (FinDelDia IS NOT NULL)
exports.obtenerPedidosListos = async (req, res) => {
    try {
        const [pedidos] = await db.execute(`
            SELECT 
                IdPedido,
                IdVendedor,
                NumeroPedido,
                IdCliente,
                FechaPedido,
                FechaVencimiento,
                IdFormaPago,
                IdListaPrecios,
                Total,
                Estado,
                FinDelDia
            FROM Pedidos 
            WHERE FinDelDia IS NOT NULL
            ORDER BY FinDelDia ASC
        `);
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos listos:', error);
        res.status(500).json({ error: 'Error al cargar pedidos listos' });
    }
};

// Obtener detalles de un pedido por NumeroPedido
exports.obtenerDetallesPorPedido = async (req, res) => {
    const { numeroPedido } = req.params;

    if (!numeroPedido) {
        return res.status(400).json({ error: 'NumeroPedido es requerido' });
    }

    try {
        const [detalles] = await db.execute(`
            SELECT 
                IdDetalle,
                NumeroPedido,
                IdProducto,
                IdLista,
                Cantidad,
                PrecioUnitario,
                Importe
            FROM DetallePedidos 
            WHERE NumeroPedido = ?
            ORDER BY IdDetalle ASC
        `, [numeroPedido]);

        res.json(detalles);
    } catch (error) {
        console.error(`Error al obtener detalles para ${numeroPedido}:`, error);
        res.status(500).json({ error: 'Error al cargar detalles del pedido' });
    }
};

// Obtener todos los clientes (para sincronización completa)
exports.obtenerClientesListos = async (req, res) => {
  try {
    const [clientes] = await db.execute(`
      SELECT 
        IdCliente,
        NumeroCliente,
        RazonSocial,
        Direccion,
        Telefono,
        IdLocalidad,
        CUIT,
        Saldo,
        CASE 
          WHEN geolocalizacion IS NOT NULL 
          THEN ST_Y(geolocalizacion)  -- Latitud
          ELSE NULL 
        END AS latitud,
        CASE 
          WHEN geolocalizacion IS NOT NULL 
          THEN ST_X(geolocalizacion)  -- Longitud
          ELSE NULL 
        END AS longitud
      FROM Clientes
      WHERE IdCliente IS NOT NULL
    `);
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno' });
  }
}; // ✅ FALTABA ESTA LLAVE DE CIERRE

// Obtener SOLO clientes con geolocalización (para sincronización parcial)
exports.obtenerGeolocalizacionClientes = async (req, res) => {
  try {
    const [clientes] = await db.execute(`
      SELECT 
        IdCliente,
        NumeroCliente,
        RazonSocial,
        Direccion,
        Telefono,
        IdLocalidad,
        CUIT,
        Saldo,
        CASE WHEN geolocalizacion IS NOT NULL THEN ST_Y(geolocalizacion) ELSE NULL END AS latitud,
        CASE WHEN geolocalizacion IS NOT NULL THEN ST_X(geolocalizacion) ELSE NULL END AS longitud
      FROM Clientes
      WHERE geolocalizacion IS NOT NULL
    `);
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener geolocalización:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Nueva función: obtener pedidos del día actual sin FinDelDia
exports.obtenerPedidosSinCerrar = async (req, res) => {
  try {
    const [pedidos] = await db.execute(`
      SELECT IdPedido, NumeroPedido, FechaPedido
      FROM Pedidos 
      WHERE FinDelDia IS NULL 
        AND DATE(FechaPedido) = CURDATE()
    `);
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos sin cerrar:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};
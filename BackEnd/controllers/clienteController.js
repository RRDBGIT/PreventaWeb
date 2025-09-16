const db = require('../models/db');

exports.obtenerClientes = async (req, res) => {
    try {
        const [clientes] = await db.execute(`
            SELECT 
                c.IdCliente AS id_cliente,
                c.NumeroCliente AS numero_cliente,
                c.RazonSocial AS razon_social,
                c.Direccion AS direccion,
                c.Telefono AS telefono,
                c.CUIT AS cuit,
                c.Saldo AS saldo,
                l.Nombre AS localidad_nombre
            FROM Clientes c
            INNER JOIN Localidades l ON c.IdLocalidad = l.IdLocalidad
            ORDER BY c.NumeroCliente
        `);
        console.log("✅ Clientes cargados:", clientes.length, "registros");
        res.json(clientes);
    } catch (error) {
        console.error("❌ ERROR en obtenerClientes:", error.message);
        res.status(500).json({ error: "Error al cargar clientes" });
    }
};

exports.crearCliente = async (req, res) => {
    const { numero_cliente, razon_social, direccion, telefono, id_localidad, cuit, saldo } = req.body;

    try {
        const [result] = await db.execute(`
            INSERT INTO Clientes (NumeroCliente, RazonSocial, Direccion, Telefono, IdLocalidad, CUIT, Saldo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [numero_cliente, razon_social, direccion, telefono, id_localidad, cuit, saldo || 0]);

        const [nuevoCliente] = await db.execute(`
            SELECT 
                c.IdCliente AS id_cliente,
                c.NumeroCliente AS numero_cliente,
                c.RazonSocial AS razon_social,
                c.Direccion AS direccion,
                c.Telefono AS telefono,
                c.CUIT AS cuit,
                c.Saldo AS saldo,
                l.Nombre AS localidad_nombre
            FROM Clientes c
            INNER JOIN Localidades l ON c.IdLocalidad = l.IdLocalidad
            WHERE c.IdCliente = ?
        `, [result.insertId]);

        console.log("✅ Cliente creado:", nuevoCliente[0]);
        res.status(201).json(nuevoCliente[0]);
    } catch (error) {
        console.error("❌ ERROR en crearCliente:", error.message);
        res.status(500).json({ error: "Error al crear cliente" });
    }
};
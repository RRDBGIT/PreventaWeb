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
                l.Nombre AS localidad_nombre,
                ST_X(c.geolocalizacion) AS longitud,
                ST_Y(c.geolocalizacion) AS latitud
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
    const { 
        razon_social, 
        direccion, 
        telefono, 
        id_localidad, 
        cuit, 
        saldo,
        latitud,
        longitud
    } = req.body;

    try {
        // ✅ Obtener todos los números de cliente existentes
        const [todos] = await db.execute(`
            SELECT NumeroCliente 
            FROM Clientes
        `);

        let maxNum = 0;
        for (const row of todos) {
            const match = row.NumeroCliente.match(/^CL(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        }

        const nuevoNumero = `CL${(maxNum + 1).toString().padStart(3, '0')}`;

        // ✅ Insertar cliente con número generado
        let sql;
        let params;

        if (latitud != null && longitud != null) {
            sql = `
                INSERT INTO Clientes (
                    NumeroCliente, RazonSocial, Direccion, Telefono, IdLocalidad, CUIT, Saldo, geolocalizacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, POINT(?, ?))
            `;
            params = [nuevoNumero, razon_social, direccion, telefono || null, id_localidad || null, cuit, saldo || 0, parseFloat(longitud), parseFloat(latitud)];
        } else {
            sql = `
                INSERT INTO Clientes (
                    NumeroCliente, RazonSocial, Direccion, Telefono, IdLocalidad, CUIT, Saldo
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            params = [nuevoNumero, razon_social, direccion, telefono || null, id_localidad || null, cuit, saldo || 0];
        }

        const [result] = await db.execute(sql, params);

        const [nuevoCliente] = await db.execute(`
            SELECT 
                c.IdCliente AS id_cliente,
                c.NumeroCliente AS numero_cliente,
                c.RazonSocial AS razon_social,
                c.Direccion AS direccion,
                c.Telefono AS telefono,
                c.CUIT AS cuit,
                c.Saldo AS saldo,
                l.Nombre AS localidad_nombre,
                ST_X(c.geolocalizacion) AS longitud,
                ST_Y(c.geolocalizacion) AS latitud
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
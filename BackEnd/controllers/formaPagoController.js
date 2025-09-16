const db = require('../models/db');

exports.obtenerFormasPago = async (req, res) => {
    try {
        const [formasPago] = await db.execute(`
            SELECT IdPago AS id, Descripcion AS descripcion
            FROM FormasDePago
            ORDER BY Descripcion
        `);
        console.log("✅ Formas de pago cargadas:", formasPago.length, "registros");
        res.json(formasPago);
    } catch (error) {
        console.error("❌ ERROR en obtenerFormasPago:", error.message);
        res.status(500).json({ error: "Error al cargar formas de pago" });
    }
};
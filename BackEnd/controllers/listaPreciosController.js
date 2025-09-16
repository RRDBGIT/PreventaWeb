const db = require('../models/db');

exports.obtenerListasPrecios = async (req, res) => {
    try {
        const [listas] = await db.execute(`
            SELECT IdLista AS id, Nombre AS nombre
            FROM ListasDePrecios
            ORDER BY Nombre
        `);
        console.log("✅ Listas de precios cargadas:", listas.length, "registros");
        res.json(listas);
    } catch (error) {
        console.error("❌ ERROR en obtenerListasPrecios:", error.message);
        res.status(500).json({ error: "Error al cargar listas de precios" });
    }
};
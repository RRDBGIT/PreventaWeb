const db = require('../models/db');

exports.obtenerLocalidades = async (req, res) => {
    try {
        const [localidades] = await db.execute(`
            SELECT IdLocalidad AS id, Nombre AS nombre
            FROM Localidades
            ORDER BY Nombre
        `);

        console.log("✅ Localidades cargadas:", localidades.length, "registros");
        res.json(localidades);
    } catch (error) {
        console.error("❌ ERROR en obtenerLocalidades:", error.message);
        res.status(500).json({ error: "Error al cargar localidades" });
    }
};
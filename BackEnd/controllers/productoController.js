// ✅ ¡IMPORTANTE! Importar la conexión a la base de datos
const db = require('../models/db');

exports.obtenerProductos = async (req, res) => {
    const { lista } = req.query;
    if (!lista) {
        return res.status(400).json({ error: 'Se requiere parámetro "lista"' });
    }

    try {
        const [productos] = await db.execute(`
            SELECT p.IdProducto, p.Codigo, p.Descripcion, ppl.Precio
            FROM Productos p
            INNER JOIN PreciosPorLista ppl ON p.IdProducto = ppl.IdProducto
            WHERE ppl.IdLista = ? AND p.Activo = TRUE
        `, [lista]);

        // Convertir Precio a número
        const productosConPrecioNumerico = productos.map(p => ({
            ...p,
            Precio: Number(p.Precio)
        }));

        res.json(productosConPrecioNumerico);
    } catch (error) {
        // 🚨 SIEMPRE loguea el error real en consola
        console.error("❌ Error en obtenerProductos:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
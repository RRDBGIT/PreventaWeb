// BackEnd/controllers/productoController.js
const db = require('../models/db');

exports.obtenerProductos = async (req, res) => {
    const { lista, codigo, buscar } = req.query; // ✅ Recibir también 'buscar'
    if (!lista) {
        return res.status(400).json({ error: 'Se requiere parámetro "lista"' });
    }

    try {
        let sql;
        let params;

        if (codigo) {
            // ✅ Búsqueda por código exacto
            sql = `
                SELECT p.IdProducto, p.Codigo, p.Descripcion, ppl.Precio
                FROM Productos p
                INNER JOIN PreciosPorLista ppl ON p.IdProducto = ppl.IdProducto
                WHERE ppl.IdLista = ? AND p.Activo = TRUE AND p.Codigo = ?
            `;
            params = [lista, codigo];
        } else if (buscar) {
            // ✅ Búsqueda por código O descripción (LIKE)
            sql = `
                SELECT p.IdProducto, p.Codigo, p.Descripcion, ppl.Precio
                FROM Productos p
                INNER JOIN PreciosPorLista ppl ON p.IdProducto = ppl.IdProducto
                WHERE ppl.IdLista = ? AND p.Activo = TRUE 
                AND (p.Codigo LIKE ? OR p.Descripcion LIKE ?)
            `;
            params = [lista, `%${buscar}%`, `%${buscar}%`];
        } else {
            // ✅ Sin filtros: devolver todos los productos de la lista
            sql = `
                SELECT p.IdProducto, p.Codigo, p.Descripcion, ppl.Precio
                FROM Productos p
                INNER JOIN PreciosPorLista ppl ON p.IdProducto = ppl.IdProducto
                WHERE ppl.IdLista = ? AND p.Activo = TRUE
            `;
            params = [lista];
        }

        const [productos] = await db.execute(sql, params);

        const productosConPrecioNumerico = productos.map(p => ({
            ...p,
            Precio: Number(p.Precio)
        }));

        res.json(productosConPrecioNumerico);
    } catch (error) {
        console.error("Error en obtenerProductos:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
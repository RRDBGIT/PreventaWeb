const db = require('../models/db');

exports.obtenerFormasPago = async (req, res) => {
    try {
        const [formas] = await db.execute('SELECT IdPago, Descripcion FROM FormasDePago');
        res.json(formas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerListasPrecios = async (req, res) => {
    try {
        const [listas] = await db.execute('SELECT IdLista, Nombre FROM ListasDePrecios');
        res.json(listas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
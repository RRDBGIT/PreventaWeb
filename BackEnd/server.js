const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/catalogos', require('./routes/catalogos'));
app.use('/api/clientes', require('./routes/clientes'));

// Ruta de prueba de salud
app.get('/health', async (req, res) => {
    try {
        const db = require('./models/db');
        const [rows] = await db.execute('SELECT 1 + 1 AS result');
        if (rows[0].result === 2) {
            res.json({ status: 'OK', message: 'Conexión a BD activa ✅' });
        }
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Sin conexión a BD ❌', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📊 Prueba manual: http://localhost:${PORT}/health`);
});
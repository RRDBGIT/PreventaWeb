//BackEnd/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes')); // ✅ Única vez
app.use('/api/productos', require('./routes/productos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/catalogos', require('./routes/catalogos'));
// ✅ Nueva ruta para actualizaciones
app.use('/api/actualizaciones', require('./routes/actualizaciones'));

// Ruta de prueba de salud
app.get('/health', async (req, res) => {
    try {//
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
// ❌ Incorrecto para acceso remoto
// app.listen(PORT, () => { ... });

// ✅ Correcto: Escucha en todas las interfaces de red
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend corriendo en http://0.0.0.0:${PORT}`);
    // Opcional: también mostrar la IP local
    const os = require('os');
    const ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(ifaceName => {
        const iface = ifaces[ifaceName];
        iface.forEach(ifaceDetails => {
            if (!ifaceDetails.internal && ifaceDetails.family === 'IPv4') {
                console.log(`   Escuchando en: http://${ifaceDetails.address}:${PORT}`);
            }
        });
    });
    console.log(`📊 Prueba manual: http://0.0.0.0:${PORT}/health`);
});
// ✅ Configuración específica para producción
app.use(cors({
    origin: 'https://mediumturquoise-parrot-283564.hostingersite.com  ', // ✅ Tu dominio en Hostinger
    credentials: true
}));
// C:\PreventaWeb\BackEnd\models\db.js

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Configuración robusta del pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,

    // ✅ Parámetros clave para evitar ECONNRESET
    enableKeepAlive: true,      // Mantener conexiones vivas
    keepAliveInitialDelay: 30000, // Enviar keep-alive cada 30s
    connectTimeout: 20000,      // Timeout de conexión: 20s
    acquireTimeout: 20000,      // Timeout al obtener conexión del pool
    timeout: 30000              // Timeout de consulta
});

// Función para manejar errores de conexión y reconectar si es necesario
pool.on('error', (err) => {
    console.error('⚠️ Error en el pool de conexiones:', err.code);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('🔄 El pool intentará reconectar automáticamente en la próxima consulta.');
    }
});

// Probar la conexión al iniciar
(async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        console.log(`   🗃️  Base de datos: ${process.env.DB_NAME}`);
        console.log(`   👤 Usuario: ${process.env.DB_USER}`);
        console.log(`   🌐 Host: ${process.env.DB_HOST}`);
        connection.release();
    } catch (error) {
        console.error('❌ ERROR al conectar con la base de datos:');
        console.error(`   📍 Host: ${process.env.DB_HOST}`);
        console.error(`   🧑‍💼 Usuario: ${process.env.DB_USER}`);
        console.error(`   🔐 Base de datos: ${process.env.DB_NAME}`);
        console.error(`   🚨 Error: ${error.message}`);
        process.exit(1);
    }
})();

module.exports = pool;
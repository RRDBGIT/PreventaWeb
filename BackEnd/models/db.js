const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión al cargar el módulo
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        console.log(`   🗃️  Base de datos: ${process.env.DB_NAME}`);
        console.log(`   👤 Usuario: ${process.env.DB_USER}`);
        console.log(`   🌐 Host: ${process.env.DB_HOST}`);
        connection.release(); // Liberar la conexión
    } catch (error) {
        console.error('❌ ERROR al conectar con la base de datos:');
        console.error(`   📍 Host: ${process.env.DB_HOST}`);
        console.error(`   🧑‍💼 Usuario: ${process.env.DB_USER}`);
        console.error(`   🔐 Base de datos: ${process.env.DB_NAME}`);
        console.error(`   🚨 Error: ${error.message}`);
        process.exit(1); // Terminar la aplicación si no hay conexión
    }
})();

module.exports = pool;
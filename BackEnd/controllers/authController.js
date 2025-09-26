// BackEnd/controllers/authController.js

const db = require('../models/db');
// const bcrypt = require('bcryptjs'); // ❌ Comentar o eliminar esta línea , para trabajar con archivos planos
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const [rows] = await db.execute(
            'SELECT IdUsuario, Usuario, Password, Rol FROM Usuarios WHERE Usuario = ? AND Activo = TRUE',
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(401).json({ msg: 'Credenciales inválidas' });
        }

        const user = rows[0];
        
        // ✅ Comparar contraseña en texto plano (sin bcrypt)
        if (password !== user.Password) {
            return res.status(401).json({ msg: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.IdUsuario, usuario: user.Usuario, rol: user.Rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            usuario: {
                id: user.IdUsuario,
                nombre: user.Usuario,
                rol: user.Rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};
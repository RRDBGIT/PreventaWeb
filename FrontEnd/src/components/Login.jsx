//C:\PreventaWeb\FrontEnd\src\components\Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Asegúrate de importar useNavigate
import API from '../services/api';

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para redirección

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar error anterior
        try {
            console.log("Intentando login..."); // 👈 Agrega esta línea para depurar
            // ✅ Llamada a la API de login (debes tener este endpoint en tu backend)
            const res = await API.post('/auth/login', { usuario, password });

            // ✅ Guardar token y datos del usuario en localStorage (o sessionStorage)
            localStorage.setItem('token', res.data.token); // Asumiendo que tu API devuelve un token
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario)); // Asumiendo que tu API devuelve info del usuario

            console.log("Login exitoso, guardando token y redirigiendo..."); // 👈 Agrega esta línea para depurar
            console.log("Token guardado:", res.data.token); // 👈 Agrega esta línea para depurar
            console.log("Usuario guardado:", res.data.usuario); // 👈 Agrega esta línea para depurar

            // ✅ Redirigir directamente a la página de pedidos usando navigate
            console.log("Ejecutando navigate('/pedido')..."); // 👈 Agrega esta línea para depurar
            navigate('/pedido');
            console.log("Después de navigate('/pedido')"); // 👈 Esta línea *sí* se ejecutará
        } catch (err) {
            // ✅ Manejar errores de login
            console.error("Error de login:", err);
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', fontFamily: 'Arial' }}>
            <h2>🔐 Iniciar Sesión</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmitLogin}>
                <input
                    type="text"
                    placeholder="Usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                />
                <button type="submit" style={{ padding: '0.5rem 1rem', width: '100%' }}>
                    Ingresar
                </button>
            </form>
        </div>
    );
};

export default Login;
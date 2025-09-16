import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [paso, setPaso] = useState(1); // 1 = login, 2 = seleccionar empresa
    const [empresas, setEmpresas] = useState([
        { id: 1, nombre: 'Empresa A - Sucursal Central' },
        { id: 2, nombre: 'Empresa B - Filial Norte' },
        { id: 3, nombre: 'Empresa C - Distribuidor Oficial' }
    ]);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const navigate = useNavigate();

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/login', { usuario, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
            setPaso(2); // Avanzar a selección de empresa
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
        }
    };

    const handleSeleccionarEmpresa = () => {
        if (!empresaSeleccionada) return alert("Seleccione una empresa");
        localStorage.setItem('empresa', JSON.stringify(empresaSeleccionada));
        navigate('/pedido');
    };

    if (paso === 1) {
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
                    <button type="submit" style={{ padding: '0.5rem 1rem', width: '100%' }}>Ingresar</button>
                </form>
            </div>
        );
    }

    // Paso 2: Seleccionar empresa
    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto', fontFamily: 'Arial' }}>
            <h2>🏢 Seleccione la Empresa</h2>
            <p>Para continuar, seleccione la empresa con la que desea trabajar.</p>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                {empresas.map(emp => (
                    <div key={emp.id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                        <label>
                            <input
                                type="radio"
                                name="empresa"
                                value={emp.id}
                                onChange={() => setEmpresaSeleccionada(emp)}
                            />
                            &nbsp; {emp.nombre}
                        </label>
                    </div>
                ))}
            </div>
            <button
                onClick={handleSeleccionarEmpresa}
                disabled={!empresaSeleccionada}
                style={{
                    padding: '0.7rem 2rem',
                    fontSize: '1.1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: empresaSeleccionada ? 'pointer' : 'not-allowed'
                }}
            >
                Ingresar
            </button>
        </div>
    );
};

export default Login;
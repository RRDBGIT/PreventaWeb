import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    if (!token || !usuario) {
        // Si no hay token o usuario, redirigir al login
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, mostrar el contenido
    return children;
};

export default PrivateRoute;
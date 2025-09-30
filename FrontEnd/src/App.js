// C:\PreventaWeb\FrontEnd\src\App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isTokenValid } from './utils/auth'; // Importa la función de verificación
import Login from './components/Login';
import Pedido from './components/Pedido';

// Componente para rutas protegidas
const RutaProtegida = ({ children }) => {
  // Verifica si el token es válido
  const isAuthenticated = isTokenValid();
  // console.log("isAuthenticated en RutaProtegida:", isAuthenticated); // Opcional para debug
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para rutas públicas (como login)
const RutaPublica = ({ children }) => {
  const isAuthenticated = isTokenValid();
  // console.log("isAuthenticated en RutaPublica:", isAuthenticated); // Opcional para debug
  return !isAuthenticated ? children : <Navigate to="/pedido" replace />;
};

function App() {
  // La lógica de autenticación ahora se maneja en los componentes RutaProtegida y RutaPublica

  return (
    <Router>
      <Routes>
        {/* Ruta pública solo para login */}
        <Route path="/login" element={
          <RutaPublica>
            <Login />
          </RutaPublica>
        } />
        {/* Ruta protegida para pedido */}
        <Route path="/pedido" element={
          <RutaProtegida>
            <Pedido />
          </RutaProtegida>
        } />
        {/* Ruta por defecto: Si está logueado, va a pedido; si no, a login */}
        <Route path="/" element={<Navigate to={isTokenValid() ? "/pedido" : "/login"} replace />} />
        {/* Ruta comodín */}
        <Route path="*" element={<Navigate to={isTokenValid() ? "/pedido" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
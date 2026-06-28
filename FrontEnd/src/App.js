// C:\PreventaWeb\FrontEnd\src\App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isTokenValid } from './utils/auth';
import Login from './components/Login';
import Pedido from './components/Pedido';
import VersionBadge from './components/VersionBadge';
import UpdateAlert from './components/UpdateAlert';

// Componente para rutas protegidas
const RutaProtegida = ({ children }) => {
  const isAuthenticated = isTokenValid();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para rutas públicas (como login)
const RutaPublica = ({ children }) => {
  const isAuthenticated = isTokenValid();
  return !isAuthenticated ? children : <Navigate to="/pedido" replace />;
};

function App() {
  return (
    <Router>
      {/* ✅ Alerta de actualización (aparece cuando hay nueva versión) */}
      <UpdateAlert />
      
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
      
      {/* ✅ Badge de versión visible en toda la app */}
      <VersionBadge position="bottom-right" />
    </Router>
  );
}

export default App;
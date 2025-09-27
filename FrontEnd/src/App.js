// C:\PreventaWeb\FrontEnd\src\App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Pedido from './components/Pedido';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/pedido"
          element={isAuthenticated ? <Pedido /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/pedido" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
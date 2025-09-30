// src/utils/auth.js

// Decodificar el payload de un JWT (sin verificar firma - solo para lectura del exp)
const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error al decodificar el token JWT:", e);
    return null;
  }
};

// Verificar si el token está presente y no ha expirado
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    // Si no hay payload o no tiene exp, asumimos que es inválido
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
  return payload.exp > currentTime;
};

// Función para obtener el token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Función para obtener el usuario
export const getUsuario = () => {
  const usuarioStr = localStorage.getItem('usuario');
  if (usuarioStr) {
    try {
      return JSON.parse(usuarioStr);
    } catch (e) {
      console.error("Error al parsear el usuario del localStorage:", e);
      return null;
    }
  }
  return null;
};

// Función para hacer logout
export const logout = (navigate) => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  if (navigate) {
    navigate('/login');
  } else {
    // Si no se proporciona navigate, forzar la redirección al login
    window.location.href = '/login';
  }
};
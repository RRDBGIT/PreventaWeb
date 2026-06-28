// FrontEnd/src/hooks/useVersionCheck.js
import { useState, useEffect } from 'react';
import API from '../services/api';

const useVersionCheck = (intervalMinutes = 5) => {
  const [frontendVersion, setFrontendVersion] = useState(null);
  const [backendVersion, setBackendVersion] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [backendUpdateAvailable, setBackendUpdateAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Versión del backend guardada en localStorage para comparar
  const LAST_BACKEND_BUILD_KEY = 'last_backend_build';

  useEffect(() => {
    const checkVersions = async () => {
      try {
        // 1. Obtener versión del frontend (archivo estático)
        const frontendRes = await fetch(`/version.json?t=${Date.now()}`);
        if (frontendRes.ok) {
          const frontendData = await frontendRes.json();
          setFrontendVersion(frontendData);
        }

        // 2. Obtener versión del backend (endpoint dinámico)
        try {
          const backendRes = await API.get('/version');
          const backendData = backendRes.data;
          setBackendVersion(backendData);

          // 3. Verificar si hay nueva versión del backend
          const lastBackendBuild = localStorage.getItem(LAST_BACKEND_BUILD_KEY);
          if (lastBackendBuild && backendData.build && backendData.build !== lastBackendBuild) {
            setBackendUpdateAvailable(true);
          }
          
          // Guardar build actual
          if (backendData.build) {
            localStorage.setItem(LAST_BACKEND_BUILD_KEY, backendData.build);
          }
        } catch (backendError) {
          console.warn('⚠️ No se pudo obtener versión del backend:', backendError.message);
          setError('Backend no disponible');
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Error al verificar versiones:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkVersions();

    // Verificar periódicamente
    const interval = setInterval(checkVersions, intervalMinutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [intervalMinutes]);

  return { 
    frontendVersion, 
    backendVersion, 
    updateAvailable, 
    backendUpdateAvailable,
    loading, 
    error 
  };
};

export default useVersionCheck;
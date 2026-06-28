import { useState, useEffect } from 'react';

const useVersion = () => {
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        // Agregar timestamp para evitar cache
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (!response.ok) throw new Error('Error al cargar versión');
        const data = await response.json();
        setVersion(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener versión:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return { version, loading, error };
};

export default useVersion;
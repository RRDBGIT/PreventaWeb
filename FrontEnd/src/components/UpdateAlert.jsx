// FrontEnd/src/components/UpdateAlert.jsx
import React, { useState } from 'react';
import useVersionCheck from '../hooks/useVersionCheck';

const UpdateAlert = () => {
  const { backendUpdateAvailable, backendVersion, loading } = useVersionCheck(5);
  const [dismissed, setDismissed] = useState(false);

  if (loading || !backendUpdateAvailable || dismissed) return null;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '90%',
      animation: 'slideDown 0.3s ease'
    }}>
      <span style={{ fontSize: '1.5rem' }}>🔄</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Backend actualizado en Render
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          Nueva versión del backend detectada: <strong>{backendVersion?.version}</strong> (build {backendVersion?.build})
        </div>
      </div>
      <button
        onClick={handleReload}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Recargar
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          padding: '0.5rem',
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem'
        }}
        title="Cerrar"
      >
        ✕
      </button>
    </div>
  );
};

export default UpdateAlert;
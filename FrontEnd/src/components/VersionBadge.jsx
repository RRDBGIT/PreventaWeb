// FrontEnd/src/components/VersionBadge.jsx
import React, { useState } from 'react';
import useVersionCheck from '../hooks/useVersionCheck';

const VersionBadge = ({ position = 'bottom-right' }) => {
  const { frontendVersion, backendVersion, loading, error } = useVersionCheck(5);
  const [expanded, setExpanded] = useState(false);

  if (loading) return null;

  const positionStyles = {
    'bottom-right': { bottom: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'top-left': { top: '10px', left: '10px' }
  };

  const containerStyle = {
    position: 'fixed',
    ...positionStyles[position],
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: expanded ? '0.75rem' : '0.5rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    zIndex: 9999,
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    maxWidth: expanded ? '280px' : 'auto',
    fontFamily: 'monospace'
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div 
      style={containerStyle}
      onClick={() => setExpanded(!expanded)}
      title="Click para expandir/colapsar"
    >
      {/* Vista compacta */}
      {!expanded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem' }}>📱</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
              FE: v{frontendVersion?.version || '?'} (b{frontendVersion?.build || '?'})
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
              BE: {backendVersion?.version || '?'} ({backendVersion?.commit || '?'})
            </div>
          </div>
        </div>
      )}

      {/* Vista expandida */}
      {expanded && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '0.25rem'
          }}>
            <strong style={{ fontSize: '0.85rem' }}>🔧 Info Versiones</strong>
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>✕</span>
          </div>

          {/* Frontend */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '0.7rem' }}>
              📱 FRONTEND
            </div>
            <div style={{ fontSize: '0.65rem', lineHeight: '1.4' }}>
              <div>Versión: <strong>{frontendVersion?.version || 'N/A'}</strong></div>
              <div>Build: <strong>{frontendVersion?.build || 'N/A'}</strong></div>
              <div>Commit: {frontendVersion?.commit || 'N/A'}</div>
              <div>Fecha: {formatTimestamp(frontendVersion?.timestamp)}</div>
            </div>
          </div>

          {/* Backend */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.7rem' }}>
              ⚙️ BACKEND
            </div>
            <div style={{ fontSize: '0.65rem', lineHeight: '1.4' }}>
              {backendVersion ? (
                <>
                  <div>Versión: <strong>{backendVersion.version}</strong></div>
                  <div>Build: <strong>{backendVersion.build}</strong></div>
                  <div>Commit: {backendVersion.commit}</div>
                  <div>Servicio: {backendVersion.servicio}</div>
                  <div>Entorno: {backendVersion.entorno}</div>
                  <div>Región: {backendVersion.region}</div>
                  <div>Node: {backendVersion.nodeVersion}</div>
                  <div>Uptime: {formatUptime(backendVersion.uptime)}</div>
                  <div>Actualizado: {formatTimestamp(backendVersion.timestamp)}</div>
                </>
              ) : (
                <div style={{ color: '#f87171' }}>
                  {error || 'No disponible'}
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            fontSize: '0.6rem', 
            opacity: 0.6, 
            textAlign: 'center',
            marginTop: '0.25rem'
          }}>
            Click para colapsar
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionBadge;
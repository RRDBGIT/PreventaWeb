// BackEnd/routes/version.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * @route   GET /api/version
 * @desc    Obtener información de versión del backend
 * @access  Público
 */
router.get('/', (req, res) => {
  try {
    // 1. Leer package.json del backend
    let packageVersion = '1.0.0';
    try {
      const packagePath = path.join(__dirname, '../package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      packageVersion = packageData.version || '1.0.0';
    } catch (err) {
      console.warn('No se pudo leer package.json del backend:', err.message);
    }

    // 2. Información de Render (variables de entorno automáticas)
    const renderInfo = {
      gitCommit: process.env.RENDER_GIT_COMMIT || 'local',
      serviceName: process.env.RENDER_SERVICE_NAME || 'backend-local',
      instanceId: process.env.RENDER_INSTANCE_ID || 'local-instance',
      serviceId: process.env.RENDER_SERVICE_ID || 'local-service',
      ver: process.env.VER || 'local',
      isProduction: process.env.NODE_ENV === 'production',
      region: process.env.RENDER_REGION || 'local'
    };

    // 3. Construir objeto de versión
    const versionData = {
      tipo: 'backend',
      version: packageVersion,
      build: renderInfo.ver,
      commit: renderInfo.gitCommit.substring(0, 7),
      commitFull: renderInfo.gitCommit,
      servicio: renderInfo.serviceName,
      instancia: renderInfo.instanceId,
      entorno: renderInfo.isProduction ? 'producción' : 'desarrollo',
      region: renderInfo.region,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      uptime: process.uptime()
    };

    console.log('📊 Solicitud de versión backend:', versionData.version, 'build:', versionData.build);
    res.json(versionData);

  } catch (error) {
    console.error('❌ Error al obtener versión del backend:', error);
    res.status(500).json({ 
      error: 'Error al obtener versión',
      tipo: 'backend',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
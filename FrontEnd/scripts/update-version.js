const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '../public/version.json');

// Leer versión actual
let versionData = {
  version: '1.0.0',
  build: 0,
  timestamp: new Date().toISOString(),
  commit: 'unknown'
};

if (fs.existsSync(versionFile)) {
  const content = fs.readFileSync(versionFile, 'utf8');
  versionData = JSON.parse(content);
}

// Incrementar build number
versionData.build = parseInt(versionData.build) + 1;
versionData.timestamp = new Date().toISOString();

// Intentar obtener el commit hash de git
try {
  const { execSync } = require('child_process');
  versionData.commit = execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  versionData.commit = 'no-git';
}

// Guardar archivo actualizado
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log(`✅ Versión actualizada: v${versionData.version} (build ${versionData.build})`);
console.log(`   Timestamp: ${versionData.timestamp}`);
console.log(`   Commit: ${versionData.commit}`);
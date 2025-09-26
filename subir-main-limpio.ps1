# subir-main-limpio.ps1
# Script para limpiar archivos grandes, aplicar gitignore y subir main al remoto

# Carpeta del proyecto
$repoPath = "C:\PreventaWeb"
Set-Location $repoPath

# ======================
# 1. Crear / actualizar .gitignore
# ======================
$gitignoreContent = @"
# Node.js / Frontend
node_modules/
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Build / Dist / Cache
dist/
build/
.cache/
.next/
out/
coverage/
.tmp/

# IDE / Editor
.vscode/
.idea/
*.swp
*.swo

# Sistema operativo
.DS_Store
Thumbs.db

# Logs
*.log

# Environment
.env
.env.local
.env.*.local

# Otros
*.tgz
*.gz
"@

$gitignorePath = Join-Path $repoPath ".gitignore"
Set-Content -Path $gitignorePath -Value $gitignoreContent -Encoding UTF8
Write-Host "✅ .gitignore actualizado"

# ======================
# 2. Quitar archivos ignorados del índice
# ======================
git rm -r --cached node_modules 2>$null
git rm -r --cached FrontEnd/node_modules/.cache 2>$null
Write-Host "✅ node_modules y cache removidos del índice"

# ======================
# 3. Commit de cambios locales
# ======================
git add .
git commit -m "Commit automático: aplicar .gitignore y limpiar archivos grandes" 2>$null
Write-Host "✅ Commit realizado"

# ======================
# 4. Limpiar archivos >100MB del historial
# ======================
Write-Host "⚠️ Eliminando archivos >100MB del historial..."
git filter-branch --force --index-filter `
    "git rm --cached --ignore-unmatch $(git rev-list --objects --all | ForEach-Object { $_ })" `
    --prune-empty --tag-name-filter cat -- --all 2>$null

git reflog expire --expire=now --all
git gc --prune=now --aggressive
Write-Host "✅ Historial limpio"

# ======================
# 5. Cambiar a main
# ======================
git checkout main
Write-Host "✅ Cambiado a la rama main"

# ======================
# 6. Subir main al remoto
# ======================
Write-Host "🚀 Subiendo main al remoto..."
git push origin main --force
Write-Host "✅ main subida correctamente"

# ======================
# 7. Mantener ventana abierta
# ======================
Write-Host "`nPresiona ENTER para cerrar el script..."
Read-Host

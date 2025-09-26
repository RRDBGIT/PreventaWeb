# subir-main-filtrado.ps1
# Script para limpiar archivos problemáticos, aplicar gitignore y subir main al remoto

# Carpeta del proyecto
$repoPath = "C:\PreventaWeb"
Set-Location $repoPath

# ======================
# 1. Crear / actualizar .gitignore
# ======================
$gitignoreContent = @"
node_modules/
.cache/
dist/
build/
*.log
.env
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Host "✅ .gitignore actualizado"

# ======================
# 2. Quitar archivos ignorados del índice
# ======================
git rm -r --cached node_modules 2>$null
git rm -r --cached .cache 2>$null
Write-Host "✅ node_modules y cache removidos del índice"

# ======================
# 3. Commit de cambios locales
# ======================
git add .
git commit -m "Commit automático: aplicar .gitignore y limpiar archivos grandes" 2>$null
Write-Host "✅ Commit realizado"

# ======================
# 4. Limpiar historial de archivos problemáticos
# ======================
Write-Host "⚠️ Limpiando historial de node_modules y cache..."
git filter-branch --force --index-filter `
"git rm -r --cached --ignore-unmatch node_modules" `
--prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter `
"git rm -r --cached --ignore-unmatch .cache" `
--prune-empty --tag-name-filter cat -- --all

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

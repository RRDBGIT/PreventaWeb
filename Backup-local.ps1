# backup-local.ps1
# Script para crear un backup local de un repositorio Git en C:\PREVENTAWEB
# Crea/actualiza una rama de backup local desde main y muestra diferencias con main

# Ruta del proyecto
Set-Location "C:\preventaWeb"

# Asegurarse de estar en main y traer lo último del remoto
git checkout main
git pull origin main

# Crear la fecha en formato YYYYMMDD
$fecha = Get-Date -Format "yyyyMMdd"

# Nombre de la rama de backup
$branchName = "backup-$fecha-branch"

# Borrar rama local si ya existe
if (git branch --list $branchName) {
    git branch -D $branchName
}

# Crear nueva rama de backup desde main
git checkout -b $branchName

# Volver a main
git checkout main

# ---------------- VERIFICACIÓN ----------------
Write-Host "`n✅ Backup local creado correctamente:"
Write-Host "Rama local: $branchName"
Write-Host "`nÚltimo commit en backup:"
git log -1 --oneline $branchName

Write-Host "`n🔍 Diferencias entre main y backup:"
git diff main $branchName

# Mantener la ventana abierta para revisar
Write-Host "`nPresiona ENTER para cerrar el script...`"
Read-Host

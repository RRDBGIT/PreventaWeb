# backup-remoto-avanzado.ps1
# Script para subir un backup local al remoto en GitHub
# Muestra diff con main y sugiere la última rama de backup por fecha

# Ruta del proyecto
Set-Location "C:\PREVENTAWEB"

# Detectar todas las ramas de backup locales
$backupBranches = git branch --list "backup-*-branch" | ForEach-Object { $_.Trim() }

# Eliminar asterisco inicial de la rama activa si existe
$backupBranches = $backupBranches | ForEach-Object { $_ -replace '^\* ', '' }

# Ordenar por fecha extraída del nombre (YYYYMMDD)
$backupBranches = $backupBranches | Sort-Object {
    if ($_ -match "backup-(\d{8})-branch") { [int]$matches[1] } else { 0 }
} -Descending

# Verificar si hay backups
if ($backupBranches.Count -eq 0) {
    Write-Host "No se encontraron ramas de backup locales."
    Read-Host "Presiona ENTER para salir..."
    exit 1
}

# Tomar la última rama de backup
$lastBackup = $backupBranches[0]
Write-Host "Última rama de backup encontrada: $lastBackup"

# Preguntar al usuario si quiere usarla o escribir otra
$branchName = Read-Host "Ingresa la rama de backup a subir (ENTER para usar '$lastBackup')"
if ([string]::IsNullOrEmpty($branchName)) {
    $branchName = $lastBackup
}

# Verificar si la rama local existe
if (-not (git branch --list $branchName)) {
    Write-Host "La rama local '$branchName' no existe."
    Read-Host "Presiona ENTER para salir..."
    exit 1
}

# Mostrar diferencias con main
Write-Host "`nDiferencias entre main y ${branchName}:"
git diff main $branchName

# Confirmar si desea continuar
$confirm = Read-Host "`nDeseas subir esta rama al remoto? Escribe 's' para sí, cualquier otra tecla para no"
if ($confirm -ne "s") {
    Write-Host "Operación cancelada."
    Read-Host "Presiona ENTER para salir..."
    exit 0
}

# Comprobar si la rama existe en remoto
$remoto = git ls-remote --heads origin | Select-String $branchName
if ($remoto) {
    Write-Host "La rama '${branchName}' ya existe en remoto. Se sobrescribirá."
} else {
    Write-Host "La rama '${branchName}' no existe en remoto. Se creará."
}

# Subir la rama al remoto (sobrescribe si ya existía)
git push -u origin $branchName --force

Write-Host "`nLa rama '${branchName}' fue subida correctamente a GitHub."

# Mantener la ventana abierta para revisar
Write-Host "`nPresiona ENTER para cerrar el script..."
Read-Host

# copiar-preventaWeb.ps1
# Script para copiar todo el contenido de C:\PreventaWeb a C:\PreventaWeb-Mirror

# Rutas
$source = "C:\PreventaWeb"
$destination = "C:\PreventaWeb-Mirror"

# Crear la carpeta destino si no existe
if (-Not (Test-Path -Path $destination)) {
    New-Item -ItemType Directory -Path $destination
    Write-Host "✅ Carpeta destino creada: $destination"
}

# Copiar todo el contenido
Write-Host "🚀 Copiando archivos de $source a $destination ..."
Copy-Item -Path "$source\*" -Destination $destination -Recurse -Force -ErrorAction Stop

Write-Host "✅ Copia completada correctamente."
Write-Host "`nPresiona ENTER para cerrar el script..."
Read-Host

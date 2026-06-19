#!/bin/bash
# Este script inicia el servidor de Mi Negocio automáticamente y abre el navegador

echo "=========================================================="
echo "🚀 INICIANDO EL SERVIDOR DE MI NEGOCIO..."
echo "=========================================================="

# Ir a la carpeta del proyecto
cd "$(dirname "$0")/frontend"

# Iniciar servidor y abrir en el navegador
echo "Abriendo el navegador en http://localhost:3000 ..."
sleep 3 && open "http://localhost:3000" &

# Correr el proyecto
npm run dev

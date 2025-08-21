#!/bin/bash

# ADMIN Bot - Termux Installation Script
echo "🤖 Instalando ADMIN Bot en Termux..."

# Update and upgrade packages
echo "📦 Actualizando paquetes..."
pkg update && pkg upgrade -y

# Install required packages
echo "🔧 Instalando dependencias..."
pkg install -y nodejs npm git python ffmpeg

# Install pnpm globally
echo "📥 Instalando pnpm..."
npm install -g pnpm

# Install project dependencies
echo "🚀 Instalando dependencias del proyecto..."
pnpm install

# Create necessary directories
echo "📁 Creando directorios..."
mkdir -p auth_info_baileys data logs

# Set permissions
chmod +x scripts/*.sh

echo "✅ ¡Instalación completada!"
echo "🚀 Para iniciar el bot, ejecuta: npm start"
echo "🌐 Panel web: http://localhost:3000"
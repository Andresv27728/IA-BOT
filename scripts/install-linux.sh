#!/bin/bash

# ADMIN Bot - Linux Installation Script
echo "🤖 Instalando ADMIN Bot en Linux..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  Este script no debe ejecutarse como root"
   exit 1
fi

# Update system packages
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
echo "🔧 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional dependencies
echo "📥 Instalando dependencias del sistema..."
sudo apt-get install -y git python3 python3-pip ffmpeg

# Install pnpm
echo "🚀 Instalando pnpm..."
npm install -g pnpm

# Install project dependencies
echo "📦 Instalando dependencias del proyecto..."
pnpm install

# Create directories
echo "📁 Configurando directorios..."
mkdir -p auth_info_baileys data logs

# Set permissions
chmod +x scripts/*.sh

# Create systemd service (optional)
read -p "¿Deseas crear un servicio systemd? (y/n): " create_service
if [[ $create_service == "y" || $create_service == "Y" ]]; then
    sudo tee /etc/systemd/system/admin-bot.service > /dev/null <<EOF
[Unit]
Description=ADMIN WhatsApp Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl enable admin-bot.service
    echo "✅ Servicio systemd creado y habilitado"
fi

echo "✅ ¡Instalación completada!"
echo "🚀 Para iniciar el bot, ejecuta: npm start"
echo "🌐 Panel web: http://localhost:3000"
echo "📋 Logs disponibles en: ./logs/"
#!/bin/bash

# ADMIN Bot - Update Script
echo "🔄 Actualizando ADMIN Bot..."

# Backup current settings
echo "💾 Creando respaldo de configuración..."
if [ -f "settings.json" ]; then
    cp settings.json settings.json.backup
    echo "✅ Configuración respaldada en settings.json.backup"
fi

# Backup database
echo "💾 Creando respaldo de base de datos..."
if [ -d "data" ]; then
    tar -czf "data_backup_$(date +%Y%m%d_%H%M%S).tar.gz" data/
    echo "✅ Base de datos respaldada"
fi

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo "📥 Descargando actualizaciones..."
    git stash push -m "Auto-stash before update"
    git pull origin main
    git stash pop
else
    echo "⚠️  No es un repositorio git. Actualización manual requerida."
fi

# Update dependencies
echo "📦 Actualizando dependencias..."
pnpm install

# Update global packages
echo "🌐 Actualizando pnpm..."
npm update -g pnpm

# Restart services if running
if pgrep -f "node index.js" > /dev/null; then
    echo "🔄 Reiniciando bot..."
    pkill -f "node index.js"
    sleep 2
    nohup node index.js > logs/bot.log 2>&1 &
    echo "✅ Bot reiniciado"
fi

# Clean up old logs (keep last 7 days)
echo "🧹 Limpiando logs antiguos..."
find logs/ -name "*.log" -type f -mtime +7 -delete 2>/dev/null

# Check for configuration updates
echo "⚙️  Verificando configuración..."
if [ -f "settings.json.backup" ] && [ -f "settings.json" ]; then
    if ! cmp -s "settings.json" "settings.json.backup"; then
        echo "⚠️  Se detectaron cambios en la configuración"
        echo "Revisa settings.json para nuevas opciones"
    fi
fi

echo "✅ ¡Actualización completada!"
echo "🚀 Bot actualizado y funcionando"
echo "📊 Versión: $(node -e "console.log(require('./package.json').version)")"
# ADMIN Bot - Windows Installation Script
Write-Host "🤖 Instalando ADMIN Bot en Windows..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  Este script requiere permisos de administrador" -ForegroundColor Yellow
    Write-Host "Ejecuta PowerShell como administrador y vuelve a intentar" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Install Chocolatey if not installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Chocolatey..." -ForegroundColor Blue
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install Node.js
Write-Host "🔧 Instalando Node.js..." -ForegroundColor Blue
choco install nodejs -y

# Install Git
Write-Host "📥 Instalando Git..." -ForegroundColor Blue
choco install git -y

# Install Python
Write-Host "🐍 Instalando Python..." -ForegroundColor Blue
choco install python -y

# Install FFmpeg
Write-Host "🎵 Instalando FFmpeg..." -ForegroundColor Blue
choco install ffmpeg -y

# Refresh environment variables
refreshenv

# Install pnpm
Write-Host "🚀 Instalando pnpm..." -ForegroundColor Blue
npm install -g pnpm

# Install project dependencies
Write-Host "📦 Instalando dependencias del proyecto..." -ForegroundColor Blue
pnpm install

# Create directories
Write-Host "📁 Creando directorios..." -ForegroundColor Blue
if (!(Test-Path "auth_info_baileys")) { New-Item -ItemType Directory -Path "auth_info_baileys" }
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" }
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }

# Create batch file for easy startup
$batchContent = @"
@echo off
title ADMIN Bot - WhatsApp Bot
echo 🤖 Iniciando ADMIN Bot...
node index.js
pause
"@

$batchContent | Out-File -FilePath "start-bot.bat" -Encoding ASCII

Write-Host "✅ ¡Instalación completada!" -ForegroundColor Green
Write-Host "🚀 Para iniciar el bot, ejecuta: npm start o haz doble clic en start-bot.bat" -ForegroundColor Cyan
Write-Host "🌐 Panel web: http://localhost:3000" -ForegroundColor Cyan
Read-Host "Presiona Enter para continuar"
# 🤖 ADMIN - Advanced WhatsApp Bot

**ADMIN** es un bot avanzado para WhatsApp desarrollado en Node.js usando la librería Baileys MD, diseñado para ofrecer múltiples funciones como administración de grupos, creación de stickers, reproducción de audios, juegos, comandos personalizados y más, todo con soporte multi-dispositivo.

## ✨ Características

- 🏗️ **Arquitectura Modular**: Estructura modular con carpetas `plugins/`, `src/`, y `lib/`
- 📱 **Multi-Dispositivo**: Compatible con Baileys MD para soporte de múltiples dispositivos
- 👥 **Administración de Grupos**: Control completo con comandos de moderación
- 🎨 **Creación de Stickers**: Convierte imágenes en stickers automáticamente
- 🎵 **Reproducción de Audio**: Descarga y reproduce música desde múltiples fuentes
- 🎮 **Juegos Interactivos**: Dados, monedas y más entretenimiento
- 🛡️ **Anti-Spam**: Protección avanzada contra spam y enlaces maliciosos
- 🌐 **Panel Web**: Dashboard web con React y TypeScript
- ⚙️ **Configuración Flexible**: Todo configurable desde `settings.json`
- 🚀 **Auto-Instalación**: Scripts para Termux, Linux y Windows
- ☁️ **Deploy Optimizado**: Compatible con Render, Vercel, Railway, Heroku

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js, Socket.IO
- **WhatsApp**: @whiskeysockets/baileys
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Base de Datos**: JSON (expandible)
- **Logging**: Pino
- **Media**: Sharp, FFmpeg

## 🚀 Instalación Rápida

### Termux (Android)
```bash
bash scripts/install-termux.sh
```

### Linux (Ubuntu/Debian)
```bash
bash scripts/install-linux.sh
```

### Windows (PowerShell como Administrador)
```powershell
.\scripts\install-windows.ps1
```

### Manual
```bash
# Clonar o descargar el proyecto
git clone <repository-url>
cd admin-whatsapp-bot

# Instalar dependencias
pnpm install

# Crear directorios necesarios
mkdir -p auth_info_baileys data logs

# Configurar permisos (Linux/Termux)
chmod +x scripts/*.sh

# Iniciar el bot
npm start
```

## ⚙️ Configuración

Todas las configuraciones se encuentran en `settings.json`:

```json
{
  "bot": {
    "name": "ADMIN",
    "prefix": ".",
    "language": "es",
    "owner": "521234567890",
    "timezone": "America/Mexico_City"
  },
  "features": {
    "antiSpam": true,
    "autoRead": false,
    "antiLink": true,
    "welcomeMessage": true,
    "autoSticker": true,
    "downloadMedia": true,
    "games": true,
    "aiChat": false
  }
}
```

### Configuraciones Importantes

- **bot.owner**: Número del propietario (con código de país sin +)
- **bot.prefix**: Prefijo para comandos (por defecto ".")
- **features**: Activar/desactivar funciones específicas

## 🎮 Comandos Disponibles

### Administración (Solo Admins)
- `.kick @usuario` - Expulsar usuario
- `.promote @usuario` - Promover a admin
- `.demote @usuario` - Quitar admin
- `.warn @usuario [razón]` - Advertir usuario

### Generales
- `.menu [categoría]` - Mostrar comandos
- `.ping` - Verificar latencia
- `.info` - Información del bot
- `.sticker` - Crear sticker (responder a imagen)

### Juegos
- `.dados [cantidad]` - Lanzar dados (1-6)
- `.moneda` - Lanzar moneda
- `.random [min] [max]` - Número aleatorio

## 🔌 Sistema de Plugins

Crea plugins personalizados en la carpeta `plugins/`:

```javascript
export default {
  name: 'MiPlugin',
  commands: [
    {
      name: 'comando',
      description: 'Mi comando personalizado',
      execute: async (bot, messageInfo) => {
        // Tu código aquí
      }
    }
  ]
};
```

## 🌐 Panel Web

Accede al dashboard web en `http://localhost:3000`

Características del panel:
- 📊 Estado del bot en tiempo real
- 📱 Código QR para conexión
- ⚙️ Configuraciones
- 📈 Estadísticas
- 📋 Logs del sistema

## 🚀 Despliegue en Producción

### Render
1. Conecta tu repositorio
2. Configura las variables de entorno
3. Deploy automático

### Vercel
1. Instala Vercel CLI: `npm i -g vercel`
2. `vercel --prod`
3. Configura las variables

### Railway
1. Conecta repositorio en railway.app
2. Deploy automático

### Variables de Entorno
```
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

## 📁 Estructura del Proyecto

```
├── index.js                 # Punto de entrada
├── settings.json            # Configuración principal
├── package.json            # Dependencias
├── src/
│   ├── bot/                # Lógica del bot
│   │   ├── WhatsAppBot.js  # Bot principal
│   │   ├── MessageHandler.js
│   │   ├── GroupManager.js
│   │   └── PluginManager.js
│   ├── database/           # Gestión de datos
│   ├── utils/              # Utilidades
│   └── pages/              # Interface web
├── plugins/                # Plugins personalizados
├── scripts/                # Scripts de instalación
├── data/                   # Base de datos
├── logs/                   # Archivos de log
└── auth_info_baileys/      # Sesión de WhatsApp
```

## 🔧 Comandos de Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo (con auto-restart)
npm run dev

# Producción
npm start

# Construcción del frontend
npm run build

# Linting
npm run lint

# Actualizar bot
bash scripts/update.sh
```

## 🛡️ Características de Seguridad

- ✅ Verificación de permisos por roles
- ✅ Sistema de advertencias automático
- ✅ Anti-spam y anti-flood
- ✅ Protección contra enlaces maliciosos
- ✅ Cooldown en comandos
- ✅ Logs detallados de actividad

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- 📧 Email: support@mgx.dev
- 💬 Discord: [MGX Community](https://discord.gg/mgx)
- 📖 Wiki: [Documentación completa](https://docs.mgx.dev)

## 🔄 Actualizaciones

El bot se mantiene actualizado mediante:
- `scripts/update.sh` - Script de actualización automática
- Auto-updater integrado
- Notificaciones de nuevas versiones

## ⚠️ Notas Importantes

1. **Cumplimiento**: Usa el bot respetando los términos de WhatsApp
2. **Rendimiento**: Optimizado para servidores con recursos limitados
3. **Escalabilidad**: Diseñado para manejar múltiples grupos simultáneamente
4. **Backup**: Realiza respaldos regulares de `data/` y `auth_info_baileys/`

---

**Desarrollado con ❤️ por MGX Team**

*Bot avanzado de WhatsApp con soporte multi-dispositivo*
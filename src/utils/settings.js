import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadSettings() {
  try {
    const settingsPath = path.join(__dirname, '../../settings.json');
    
    if (fs.existsSync(settingsPath)) {
      return fs.readJsonSync(settingsPath);
    }
    
    // Return default settings if file doesn't exist
    return getDefaultSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    const settingsPath = path.join(__dirname, '../../settings.json');
    fs.writeJsonSync(settingsPath, settings, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

function getDefaultSettings() {
  return {
    bot: {
      name: "ADMIN",
      prefix: ".",
      language: "es",
      owner: "521234567890",
      timezone: "America/Mexico_City"
    },
    features: {
      antiSpam: true,
      autoRead: false,
      antiLink: true,
      welcomeMessage: true,
      autoSticker: true,
      downloadMedia: true,
      games: true,
      aiChat: false
    },
    groups: {
      adminOnly: false,
      maxWarnings: 3,
      muteTime: 300000,
      antiFlood: true
    },
    media: {
      maxFileSize: 50,
      allowedFormats: ["jpg", "png", "gif", "mp4", "mp3", "pdf"],
      stickerQuality: 100
    },
    messages: {
      welcome: "¡Bienvenido/a {user} al grupo {group}! 👋\n\nPor favor lee las reglas del grupo.",
      farewell: "¡Hasta luego {user}! 👋",
      promote: "¡{user} ha sido promovido/a a administrador! 🎉",
      demote: "{user} ya no es administrador.",
      ban: "{user} ha sido expulsado del grupo.",
      mute: "{user} ha sido silenciado por {time}.",
      warn: "⚠️ Advertencia {count}/{max} para {user}.\nMotivo: {reason}"
    },
    commands: {
      enabled: true,
      cooldown: 3000,
      maxPerMinute: 10
    },
    database: {
      type: "json",
      path: "./data/database.json"
    },
    logs: {
      level: "info",
      saveToFile: true,
      maxFiles: 7
    }
  };
}
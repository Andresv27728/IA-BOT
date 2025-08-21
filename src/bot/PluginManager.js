import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PluginManager {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Map();
    this.plugins = new Map();
  }

  async loadPlugins() {
    try {
      const pluginsDir = path.join(__dirname, '../../plugins');
      await fs.ensureDir(pluginsDir);

      // Load built-in commands
      await this.loadBuiltInCommands();

      // Load external plugins
      const pluginFiles = await fs.readdir(pluginsDir);
      
      for (const file of pluginFiles) {
        if (file.endsWith('.js')) {
          try {
            const pluginPath = path.join(pluginsDir, file);
            const plugin = await import(pluginPath);
            
            if (plugin.default) {
              this.registerPlugin(plugin.default);
            }
          } catch (error) {
            logger.error(`Failed to load plugin ${file}:`, error);
          }
        }
      }

      logger.info(`Loaded ${this.commands.size} commands`);
    } catch (error) {
      logger.error('Plugin loading error:', error);
    }
  }

  async loadBuiltInCommands() {
    // Admin Commands
    this.registerCommand('kick', {
      description: 'Expulsar usuario del grupo',
      usage: '.kick @usuario',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, message } = messageInfo;
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
          return bot.sendMessage(jid, { text: '❌ Menciona al usuario que deseas expulsar.' });
        }

        const targetUser = mentioned[0];
        await bot.groupManager.kickUser(jid, targetUser);
      }
    });

    this.registerCommand('promote', {
      description: 'Promover usuario a admin',
      usage: '.promote @usuario',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, message } = messageInfo;
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
          return bot.sendMessage(jid, { text: '❌ Menciona al usuario que deseas promover.' });
        }

        const targetUser = mentioned[0];
        await bot.groupManager.promoteUser(jid, targetUser);
      }
    });

    this.registerCommand('demote', {
      description: 'Quitar admin a usuario',
      usage: '.demote @usuario',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, message } = messageInfo;
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
          return bot.sendMessage(jid, { text: '❌ Menciona al usuario que deseas degradar.' });
        }

        const targetUser = mentioned[0];
        await bot.groupManager.demoteUser(jid, targetUser);
      }
    });

    this.registerCommand('warn', {
      description: 'Advertir a un usuario',
      usage: '.warn @usuario [razón]',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, message, args } = messageInfo;
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
          return bot.sendMessage(jid, { text: '❌ Menciona al usuario que deseas advertir.' });
        }

        const targetUser = mentioned[0];
        const reason = args.join(' ') || 'Violación de reglas del grupo';
        
        await bot.groupManager.warnUser(jid, targetUser, reason);
      }
    });

    // Utility Commands
    this.registerCommand('menu', {
      description: 'Mostrar menú de comandos',
      usage: '.menu [categoría]',
      category: 'general',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        const category = args[0];
        
        let menuText = `🤖 *${bot.settings.bot.name} - Menú de Comandos*\n\n`;
        
        const categories = new Map();
        
        for (const [name, cmd] of this.commands) {
          const cat = cmd.category || 'general';
          if (!categories.has(cat)) {
            categories.set(cat, []);
          }
          categories.get(cat).push({ name, ...cmd });
        }

        if (category && categories.has(category)) {
          menuText += `📂 *Categoría: ${category}*\n\n`;
          for (const cmd of categories.get(category)) {
            menuText += `▫️ *${bot.settings.bot.prefix}${cmd.name}*\n`;
            menuText += `   ${cmd.description}\n`;
            menuText += `   📝 ${cmd.usage}\n\n`;
          }
        } else {
          menuText += `📋 *Categorías disponibles:*\n\n`;
          for (const [catName, commands] of categories) {
            menuText += `📂 *${catName}* (${commands.length} comandos)\n`;
            menuText += `   ${bot.settings.bot.prefix}menu ${catName}\n\n`;
          }
        }

        menuText += `\n💡 *Uso:* ${bot.settings.bot.prefix}menu [categoría]`;
        
        await bot.sendMessage(jid, { text: menuText });
      }
    });

    this.registerCommand('sticker', {
      description: 'Crear sticker de imagen',
      usage: '.sticker (responder a imagen)',
      category: 'media',
      execute: async (bot, messageInfo) => {
        const { jid, message } = messageInfo;
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage?.imageMessage) {
          return bot.sendMessage(jid, { text: '❌ Responde a una imagen para crear un sticker.' });
        }

        try {
          const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
          const media = await downloadMediaMessage({
            key: message.message.extendedTextMessage.contextInfo.stanzaId,
            message: quotedMessage
          }, 'buffer');

          const stickerBuffer = await this.createSticker(media);
          await bot.sendMessage(jid, { sticker: stickerBuffer });
        } catch (error) {
          logger.error('Sticker creation error:', error);
          await bot.sendMessage(jid, { text: '❌ Error al crear el sticker.' });
        }
      }
    });

    this.registerCommand('ping', {
      description: 'Verificar latencia del bot',
      usage: '.ping',
      category: 'general',
      execute: async (bot, messageInfo) => {
        const { jid } = messageInfo;
        const start = Date.now();
        
        await bot.sendMessage(jid, { text: '🏓 Calculando latencia...' });
        
        const latency = Date.now() - start;
        await bot.sendMessage(jid, { 
          text: `🏓 *Pong!*\n\n⚡ Latencia: ${latency}ms\n⏰ Uptime: ${this.formatUptime(process.uptime())}`
        });
      }
    });

    this.registerCommand('info', {
      description: 'Información del bot',
      usage: '.info',
      category: 'general',
      execute: async (bot, messageInfo) => {
        const { jid } = messageInfo;
        
        const info = `🤖 *Información del Bot*\n\n` +
                    `📱 *Nombre:* ${bot.settings.bot.name}\n` +
                    `🔧 *Versión:* 1.0.0\n` +
                    `⏰ *Uptime:* ${this.formatUptime(process.uptime())}\n` +
                    `📊 *Comandos:* ${this.commands.size}\n` +
                    `🌐 *Prefijo:* ${bot.settings.bot.prefix}\n` +
                    `💾 *Node.js:* ${process.version}\n\n` +
                    `👨‍💻 *Desarrollado por:* MGX Team`;

        await bot.sendMessage(jid, { text: info });
      }
    });

    // Game Commands
    this.registerCommand('dados', {
      description: 'Lanzar dados',
      usage: '.dados [cantidad]',
      category: 'games',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        const count = parseInt(args[0]) || 1;
        
        if (count > 6 || count < 1) {
          return bot.sendMessage(jid, { text: '❌ Solo puedes lanzar entre 1 y 6 dados.' });
        }

        const results = [];
        for (let i = 0; i < count; i++) {
          results.push(Math.floor(Math.random() * 6) + 1);
        }

        const total = results.reduce((a, b) => a + b, 0);
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const resultText = results.map(r => diceEmojis[r - 1]).join(' ');

        await bot.sendMessage(jid, { 
          text: `🎲 *Resultado de los dados:*\n\n${resultText}\n\n📊 *Total:* ${total}`
        });
      }
    });

    this.registerCommand('moneda', {
      description: 'Lanzar moneda',
      usage: '.moneda',
      category: 'games',
      execute: async (bot, messageInfo) => {
        const { jid } = messageInfo;
        const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
        const emoji = result === 'Cara' ? '🪙' : '💰';
        
        await bot.sendMessage(jid, { 
          text: `${emoji} *Resultado:* ${result}`
        });
      }
    });
  }

  registerPlugin(plugin) {
    try {
      if (plugin.commands) {
        for (const command of plugin.commands) {
          this.registerCommand(command.name, command);
        }
      }
      
      this.plugins.set(plugin.name, plugin);
      logger.info(`Plugin registered: ${plugin.name}`);
    } catch (error) {
      logger.error('Plugin registration error:', error);
    }
  }

  registerCommand(name, command) {
    this.commands.set(name.toLowerCase(), command);
  }

  getCommand(name) {
    return this.commands.get(name.toLowerCase());
  }

  async createSticker(imageBuffer) {
    try {
      // Resize and optimize image for sticker
      const stickerBuffer = await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: this.bot.settings.media.stickerQuality })
        .toBuffer();

      return stickerBuffer;
    } catch (error) {
      logger.error('Sticker processing error:', error);
      throw error;
    }
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}

export default PluginManager;
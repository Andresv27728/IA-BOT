import logger from '../utils/logger.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs-extra';
import path from 'path';

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.commandCooldowns = new Map();
  }

  async handleMessage(m) {
    try {
      const message = m.messages[0];
      if (!message || message.key.fromMe) return;

      // Save message to database
      await this.bot.database.saveMessage(message);

      const messageInfo = this.extractMessageInfo(message);
      if (!messageInfo) return;

      // Handle different message types
      if (messageInfo.isCommand) {
        await this.handleCommand(messageInfo);
      } else {
        await this.handleRegularMessage(messageInfo);
      }

    } catch (error) {
      logger.error('Message handling error:', error);
    }
  }

  extractMessageInfo(message) {
    const jid = message.key.remoteJid;
    const sender = message.key.participant || jid;
    const isGroup = jid.endsWith('@g.us');
    const messageText = message.message?.conversation || 
                       message.message?.extendedTextMessage?.text || 
                       message.message?.imageMessage?.caption ||
                       message.message?.videoMessage?.caption || '';

    if (!messageText) return null;

    const isCommand = messageText.startsWith(this.bot.settings.bot.prefix);
    const command = isCommand ? messageText.slice(1).split(' ')[0].toLowerCase() : '';
    const args = isCommand ? messageText.slice(1).split(' ').slice(1) : [];

    return {
      message,
      jid,
      sender,
      isGroup,
      messageText,
      isCommand,
      command,
      args,
      quotedMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage
    };
  }

  async handleCommand(messageInfo) {
    const { command, sender, jid, args } = messageInfo;

    // Check cooldown
    if (this.isOnCooldown(sender, command)) {
      return;
    }

    // Check if command exists in plugins
    const plugin = this.bot.pluginManager.getCommand(command);
    if (!plugin) return;

    // Check permissions
    if (plugin.ownerOnly && !this.bot.isOwner(sender)) {
      await this.bot.sendMessage(jid, { 
        text: '❌ Este comando solo puede ser usado por el propietario.' 
      });
      return;
    }

    if (plugin.adminOnly && messageInfo.isGroup) {
      const isAdmin = await this.bot.isAdmin(sender, jid);
      if (!isAdmin) {
        await this.bot.sendMessage(jid, { 
          text: '❌ Este comando solo puede ser usado por administradores.' 
        });
        return;
      }
    }

    if (plugin.groupOnly && !messageInfo.isGroup) {
      await this.bot.sendMessage(jid, { 
        text: '❌ Este comando solo puede ser usado en grupos.' 
      });
      return;
    }

    try {
      // Set cooldown
      this.setCooldown(sender, command);

      // Execute command
      await plugin.execute(this.bot, messageInfo);

      logger.info(`Command executed: ${command} by ${sender}`);
    } catch (error) {
      logger.error(`Command error (${command}):`, error);
      await this.bot.sendMessage(jid, { 
        text: '❌ Error al ejecutar el comando. Inténtalo más tarde.' 
      });
    }
  }

  async handleRegularMessage(messageInfo) {
    const { message, jid, sender, isGroup } = messageInfo;

    // Auto-read messages if enabled
    if (this.bot.settings.features.autoRead) {
      await this.bot.sock.readMessages([message.key]);
    }

    // Handle media auto-sticker
    if (this.bot.settings.features.autoSticker && message.message?.imageMessage) {
      const media = await downloadMediaMessage(message, 'buffer');
      if (media) {
        await this.createSticker(jid, media);
      }
    }

    // Anti-link protection
    if (this.bot.settings.features.antiLink && isGroup && messageInfo.messageText.includes('chat.whatsapp.com')) {
      const isAdmin = await this.bot.isAdmin(sender, jid);
      const isBotAdmin = await this.bot.isBotAdmin(jid);
      
      if (!isAdmin && isBotAdmin) {
        await this.bot.sock.sendMessage(jid, {
          delete: message.key
        });
        await this.bot.sendMessage(jid, {
          text: '❌ Enlaces de WhatsApp no permitidos en este grupo.'
        });
      }
    }

    // Anti-spam protection
    if (this.bot.settings.features.antiSpam) {
      // Implementation for anti-spam logic
    }
  }

  async createSticker(jid, imageBuffer) {
    try {
      const stickerBuffer = await this.bot.pluginManager.createSticker(imageBuffer);
      await this.bot.sendMessage(jid, {
        sticker: stickerBuffer
      });
    } catch (error) {
      logger.error('Sticker creation error:', error);
    }
  }

  isOnCooldown(userId, command) {
    const key = `${userId}_${command}`;
    const now = Date.now();
    const cooldown = this.commandCooldowns.get(key);
    
    if (cooldown && now < cooldown) {
      return true;
    }
    return false;
  }

  setCooldown(userId, command) {
    const key = `${userId}_${command}`;
    const cooldownTime = this.bot.settings.commands.cooldown || 3000;
    this.commandCooldowns.set(key, Date.now() + cooldownTime);
    
    // Clean up old cooldowns
    setTimeout(() => {
      this.commandCooldowns.delete(key);
    }, cooldownTime);
  }
}

export default MessageHandler;
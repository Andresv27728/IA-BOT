import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  MessageType,
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import logger from '../utils/logger.js';
import MessageHandler from './MessageHandler.js';
import GroupManager from './GroupManager.js';
import PluginManager from './PluginManager.js';
import DatabaseManager from '../database/DatabaseManager.js';

class WhatsAppBot {
  constructor(settings, io) {
    this.settings = settings;
    this.io = io;
    this.sock = null;
    this.qrRetries = 0;
    this.maxQrRetries = 5;
    this.status = 'disconnected';
    
    // Initialize managers
    this.messageHandler = new MessageHandler(this);
    this.groupManager = new GroupManager(this);
    this.pluginManager = new PluginManager(this);
    this.database = new DatabaseManager(this.settings.database);
  }

  async initialize() {
    try {
      await this.database.initialize();
      await this.pluginManager.loadPlugins();
      await this.connect();
    } catch (error) {
      logger.error('Bot initialization failed:', error);
      throw error;
    }
  }

  async connect() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
      
      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: logger,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        defaultQueryTimeoutMs: 60000,
        getMessage: async (key) => {
          if (this.database) {
            const message = await this.database.getMessage(key.id);
            return message?.message || {};
          }
          return {};
        }
      });

      this.setupEventHandlers();
      
      this.sock.ev.on('creds.update', saveCreds);
      
    } catch (error) {
      logger.error('Connection failed:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        this.handleQR(qr);
      }
      
      if (connection === 'close') {
        await this.handleDisconnection(lastDisconnect);
      } else if (connection === 'open') {
        await this.handleConnection();
      }
    });

    this.sock.ev.on('messages.upsert', async (m) => {
      await this.messageHandler.handleMessage(m);
    });

    this.sock.ev.on('group-participants.update', async (update) => {
      await this.groupManager.handleParticipantUpdate(update);
    });

    this.sock.ev.on('groups.update', async (updates) => {
      await this.groupManager.handleGroupUpdate(updates);
    });
  }

  async handleQR(qr) {
    try {
      const qrImage = await qrcode.toDataURL(qr);
      this.io.emit('qr-code', { qr: qrImage, retries: this.qrRetries });
      
      this.qrRetries++;
      if (this.qrRetries >= this.maxQrRetries) {
        logger.warn('Max QR retries reached');
        this.io.emit('qr-expired');
      }
      
      logger.info(`QR Code generated (${this.qrRetries}/${this.maxQrRetries})`);
    } catch (error) {
      logger.error('QR generation failed:', error);
    }
  }

  async handleConnection() {
    this.status = 'connected';
    this.qrRetries = 0;
    
    const botInfo = {
      name: this.settings.bot.name,
      number: this.sock.user.id.split(':')[0],
      status: 'online'
    };
    
    this.io.emit('bot-connected', botInfo);
    logger.info(`✅ ${this.settings.bot.name} connected successfully`);
    logger.info(`📱 Bot number: ${botInfo.number}`);
    
    // Set bot presence
    await this.sock.sendPresenceUpdate('available');
    
    // Send startup message to owner
    if (this.settings.bot.owner) {
      await this.sendMessage(this.settings.bot.owner + '@s.whatsapp.net', {
        text: `🤖 *${this.settings.bot.name}* está online!\n\n⏰ Iniciado: ${new Date().toLocaleString()}\n🔧 Versión: 1.0.0\n\n✅ Todos los sistemas operativos.`
      });
    }
  }

  async handleDisconnection(lastDisconnect) {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    
    logger.info(`Connection closed. Reason: ${reason}`);
    this.status = 'disconnected';
    this.io.emit('bot-disconnected', { reason });
    
    if (reason === DisconnectReason.badSession) {
      logger.error('Bad session file, please delete and scan again');
      this.io.emit('session-expired');
    } else if (reason === DisconnectReason.connectionClosed) {
      logger.info('Connection closed, reconnecting...');
      await this.reconnect();
    } else if (reason === DisconnectReason.connectionLost) {
      logger.info('Connection lost, reconnecting...');
      await this.reconnect();
    } else if (reason === DisconnectReason.connectionReplaced) {
      logger.error('Connection replaced, another instance opened');
    } else if (reason === DisconnectReason.loggedOut) {
      logger.error('Device logged out, delete session and scan again');
      this.io.emit('logged-out');
    } else if (reason === DisconnectReason.restartRequired) {
      logger.info('Restart required, restarting...');
      await this.restart();
    } else if (reason === DisconnectReason.timedOut) {
      logger.info('Connection timed out, reconnecting...');
      await this.reconnect();
    } else {
      logger.error(`Unknown disconnect reason: ${reason}`);
      await this.reconnect();
    }
  }

  async sendMessage(jid, content, options = {}) {
    try {
      if (!this.sock || this.status !== 'connected') {
        throw new Error('Bot not connected');
      }
      
      return await this.sock.sendMessage(jid, content, options);
    } catch (error) {
      logger.error('Send message failed:', error);
      throw error;
    }
  }

  async reconnect() {
    try {
      setTimeout(async () => {
        logger.info('Attempting to reconnect...');
        await this.connect();
      }, 3000);
    } catch (error) {
      logger.error('Reconnection failed:', error);
    }
  }

  async restart() {
    try {
      if (this.sock) {
        await this.sock.logout();
      }
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    } catch (error) {
      logger.error('Restart failed:', error);
    }
  }

  async disconnect() {
    try {
      if (this.sock) {
        await this.sock.logout();
      }
      this.status = 'disconnected';
      logger.info('Bot disconnected successfully');
    } catch (error) {
      logger.error('Disconnect failed:', error);
    }
  }

  getStatus() {
    return {
      status: this.status,
      retries: this.qrRetries,
      uptime: process.uptime()
    };
  }

  // Utility methods
  isOwner(jid) {
    const number = jid.replace('@s.whatsapp.net', '');
    return number === this.settings.bot.owner;
  }

  async isAdmin(jid, groupId) {
    try {
      const groupMetadata = await this.sock.groupMetadata(groupId);
      const participant = groupMetadata.participants.find(p => p.id === jid);
      return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
      return false;
    }
  }

  async isBotAdmin(groupId) {
    try {
      const groupMetadata = await this.sock.groupMetadata(groupId);
      const botJid = this.sock.user.id;
      const participant = groupMetadata.participants.find(p => p.id === botJid);
      return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
      return false;
    }
  }
}

export default WhatsAppBot;
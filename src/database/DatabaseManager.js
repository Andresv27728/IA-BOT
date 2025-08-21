import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger.js';

class DatabaseManager {
  constructor(config) {
    this.config = config;
    this.data = {
      messages: [],
      users: {},
      groups: {},
      settings: {}
    };
    this.dbPath = config.path || './data/database.json';
  }

  async initialize() {
    try {
      await fs.ensureDir(path.dirname(this.dbPath));
      
      if (await fs.pathExists(this.dbPath)) {
        const data = await fs.readJson(this.dbPath);
        this.data = { ...this.data, ...data };
      }
      
      logger.info('Database initialized');
    } catch (error) {
      logger.error('Database initialization error:', error);
      throw error;
    }
  }

  async saveMessage(message) {
    try {
      const messageData = {
        id: message.key.id,
        from: message.key.remoteJid,
        sender: message.key.participant || message.key.remoteJid,
        timestamp: Date.now(),
        message: message.message
      };

      this.data.messages.push(messageData);
      
      // Keep only last 1000 messages
      if (this.data.messages.length > 1000) {
        this.data.messages = this.data.messages.slice(-1000);
      }

      await this.save();
    } catch (error) {
      logger.error('Save message error:', error);
    }
  }

  async getMessage(messageId) {
    return this.data.messages.find(msg => msg.id === messageId);
  }

  async saveUser(userId, userData) {
    try {
      this.data.users[userId] = {
        ...this.data.users[userId],
        ...userData,
        lastSeen: Date.now()
      };
      
      await this.save();
    } catch (error) {
      logger.error('Save user error:', error);
    }
  }

  async getUser(userId) {
    return this.data.users[userId] || {};
  }

  async saveGroup(groupId, groupData) {
    try {
      this.data.groups[groupId] = {
        ...this.data.groups[groupId],
        ...groupData,
        lastUpdated: Date.now()
      };
      
      await this.save();
    } catch (error) {
      logger.error('Save group error:', error);
    }
  }

  async getGroup(groupId) {
    return this.data.groups[groupId] || {};
  }

  async updateUserStats(userId, action) {
    try {
      const user = await this.getUser(userId);
      
      if (!user.stats) {
        user.stats = {
          messageCount: 0,
          commandsUsed: 0,
          joinDate: Date.now()
        };
      }

      switch (action) {
        case 'message':
          user.stats.messageCount++;
          break;
        case 'command':
          user.stats.commandsUsed++;
          break;
      }

      await this.saveUser(userId, user);
    } catch (error) {
      logger.error('Update user stats error:', error);
    }
  }

  async getTopUsers(limit = 10) {
    try {
      const users = Object.entries(this.data.users)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => (b.stats?.messageCount || 0) - (a.stats?.messageCount || 0))
        .slice(0, limit);

      return users;
    } catch (error) {
      logger.error('Get top users error:', error);
      return [];
    }
  }

  async save() {
    try {
      await fs.writeJson(this.dbPath, this.data, { spaces: 2 });
    } catch (error) {
      logger.error('Database save error:', error);
    }
  }

  async backup() {
    try {
      const backupPath = `${this.dbPath}.backup.${Date.now()}`;
      await fs.copy(this.dbPath, backupPath);
      logger.info(`Database backed up to: ${backupPath}`);
    } catch (error) {
      logger.error('Database backup error:', error);
    }
  }

  async cleanup() {
    try {
      // Remove old messages (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      this.data.messages = this.data.messages.filter(msg => msg.timestamp > thirtyDaysAgo);
      
      await this.save();
      logger.info('Database cleanup completed');
    } catch (error) {
      logger.error('Database cleanup error:', error);
    }
  }
}

export default DatabaseManager;
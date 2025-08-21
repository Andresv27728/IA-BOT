import logger from '../utils/logger.js';

class GroupManager {
  constructor(bot) {
    this.bot = bot;
    this.userWarnings = new Map();
  }

  async handleParticipantUpdate(update) {
    try {
      const { id: groupId, participants, action } = update;
      
      for (const participant of participants) {
        switch (action) {
          case 'add':
            await this.handleUserJoin(groupId, participant);
            break;
          case 'remove':
            await this.handleUserLeave(groupId, participant);
            break;
          case 'promote':
            await this.handleUserPromote(groupId, participant);
            break;
          case 'demote':
            await this.handleUserDemote(groupId, participant);
            break;
        }
      }
    } catch (error) {
      logger.error('Group participant update error:', error);
    }
  }

  async handleGroupUpdate(updates) {
    try {
      for (const update of updates) {
        if (update.subject) {
          logger.info(`Group ${update.id} name changed to: ${update.subject}`);
        }
        if (update.desc) {
          logger.info(`Group ${update.id} description changed`);
        }
      }
    } catch (error) {
      logger.error('Group update error:', error);
    }
  }

  async handleUserJoin(groupId, participant) {
    try {
      if (!this.bot.settings.features.welcomeMessage) return;

      const groupMetadata = await this.bot.sock.groupMetadata(groupId);
      const welcomeText = this.bot.settings.messages.welcome
        .replace('{user}', `@${participant.split('@')[0]}`)
        .replace('{group}', groupMetadata.subject);

      await this.bot.sendMessage(groupId, {
        text: welcomeText,
        mentions: [participant]
      });

      logger.info(`User joined: ${participant} in group ${groupMetadata.subject}`);
    } catch (error) {
      logger.error('Welcome message error:', error);
    }
  }

  async handleUserLeave(groupId, participant) {
    try {
      if (!this.bot.settings.features.welcomeMessage) return;

      const groupMetadata = await this.bot.sock.groupMetadata(groupId);
      const farewellText = this.bot.settings.messages.farewell
        .replace('{user}', `@${participant.split('@')[0]}`);

      await this.bot.sendMessage(groupId, {
        text: farewellText,
        mentions: [participant]
      });

      // Clean up user warnings
      this.userWarnings.delete(participant);

      logger.info(`User left: ${participant} from group ${groupMetadata.subject}`);
    } catch (error) {
      logger.error('Farewell message error:', error);
    }
  }

  async handleUserPromote(groupId, participant) {
    try {
      const groupMetadata = await this.bot.sock.groupMetadata(groupId);
      const promoteText = this.bot.settings.messages.promote
        .replace('{user}', `@${participant.split('@')[0]}`);

      await this.bot.sendMessage(groupId, {
        text: promoteText,
        mentions: [participant]
      });

      logger.info(`User promoted: ${participant} in group ${groupMetadata.subject}`);
    } catch (error) {
      logger.error('Promote message error:', error);
    }
  }

  async handleUserDemote(groupId, participant) {
    try {
      const groupMetadata = await this.bot.sock.groupMetadata(groupId);
      const demoteText = this.bot.settings.messages.demote
        .replace('{user}', `@${participant.split('@')[0]}`);

      await this.bot.sendMessage(groupId, {
        text: demoteText,
        mentions: [participant]
      });

      logger.info(`User demoted: ${participant} in group ${groupMetadata.subject}`);
    } catch (error) {
      logger.error('Demote message error:', error);
    }
  }

  async warnUser(groupId, userId, reason = 'Violación de reglas') {
    try {
      const warningKey = `${groupId}_${userId}`;
      const currentWarnings = this.userWarnings.get(warningKey) || 0;
      const newWarnings = currentWarnings + 1;
      const maxWarnings = this.bot.settings.groups.maxWarnings;

      this.userWarnings.set(warningKey, newWarnings);

      if (newWarnings >= maxWarnings) {
        // Auto-kick user
        await this.kickUser(groupId, userId);
        this.userWarnings.delete(warningKey);
      } else {
        const warnText = this.bot.settings.messages.warn
          .replace('{user}', `@${userId.split('@')[0]}`)
          .replace('{count}', newWarnings)
          .replace('{max}', maxWarnings)
          .replace('{reason}', reason);

        await this.bot.sendMessage(groupId, {
          text: warnText,
          mentions: [userId]
        });
      }

      return newWarnings;
    } catch (error) {
      logger.error('Warn user error:', error);
      throw error;
    }
  }

  async kickUser(groupId, userId) {
    try {
      const isBotAdmin = await this.bot.isBotAdmin(groupId);
      if (!isBotAdmin) {
        throw new Error('Bot is not admin');
      }

      await this.bot.sock.groupParticipantsUpdate(groupId, [userId], 'remove');

      const banText = this.bot.settings.messages.ban
        .replace('{user}', `@${userId.split('@')[0]}`);

      await this.bot.sendMessage(groupId, {
        text: banText,
        mentions: [userId]
      });

      logger.info(`User kicked: ${userId} from group ${groupId}`);
    } catch (error) {
      logger.error('Kick user error:', error);
      throw error;
    }
  }

  async muteUser(groupId, userId, duration = 300000) {
    try {
      const muteText = this.bot.settings.messages.mute
        .replace('{user}', `@${userId.split('@')[0]}`)
        .replace('{time}', `${Math.floor(duration / 60000)} minutos`);

      await this.bot.sendMessage(groupId, {
        text: muteText,
        mentions: [userId]
      });

      // Store mute info (in a real implementation, you'd want to persist this)
      const muteKey = `${groupId}_${userId}`;
      const muteUntil = Date.now() + duration;
      
      // For demonstration - in production, implement actual muting logic
      setTimeout(() => {
        logger.info(`User unmuted: ${userId} in group ${groupId}`);
      }, duration);

      logger.info(`User muted: ${userId} in group ${groupId} for ${Math.floor(duration / 60000)} minutes`);
    } catch (error) {
      logger.error('Mute user error:', error);
      throw error;
    }
  }

  async promoteUser(groupId, userId) {
    try {
      const isBotAdmin = await this.bot.isBotAdmin(groupId);
      if (!isBotAdmin) {
        throw new Error('Bot is not admin');
      }

      await this.bot.sock.groupParticipantsUpdate(groupId, [userId], 'promote');

      const promoteText = this.bot.settings.messages.promote
        .replace('{user}', `@${userId.split('@')[0]}`);

      await this.bot.sendMessage(groupId, {
        text: promoteText,
        mentions: [userId]
      });

      logger.info(`User promoted: ${userId} in group ${groupId}`);
    } catch (error) {
      logger.error('Promote user error:', error);
      throw error;
    }
  }

  async demoteUser(groupId, userId) {
    try {
      const isBotAdmin = await this.bot.isBotAdmin(groupId);
      if (!isBotAdmin) {
        throw new Error('Bot is not admin');
      }

      await this.bot.sock.groupParticipantsUpdate(groupId, [userId], 'demote');

      const demoteText = this.bot.settings.messages.demote
        .replace('{user}', `@${userId.split('@')[0]}`);

      await this.bot.sendMessage(groupId, {
        text: demoteText,
        mentions: [userId]
      });

      logger.info(`User demoted: ${userId} in group ${groupId}`);
    } catch (error) {
      logger.error('Demote user error:', error);
      throw error;
    }
  }

  getUserWarnings(groupId, userId) {
    const warningKey = `${groupId}_${userId}`;
    return this.userWarnings.get(warningKey) || 0;
  }

  clearUserWarnings(groupId, userId) {
    const warningKey = `${groupId}_${userId}`;
    this.userWarnings.delete(warningKey);
  }
}

export default GroupManager;
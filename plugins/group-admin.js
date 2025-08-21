// Group Administration Plugin - 10 Advanced Commands
export default {
  name: 'GroupAdminPlugin',
  version: '1.0.0',
  description: 'Plugin avanzado de administración de grupos con 10 comandos especializados',
  
  commands: [
    {
      name: 'setwelcome',
      description: 'Configurar mensaje de bienvenida personalizado',
      usage: '.setwelcome <mensaje>',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona un mensaje de bienvenida.\nEjemplo: .setwelcome ¡Bienvenido {user} al grupo {group}!' 
          });
        }

        const welcomeMessage = args.join(' ');
        await bot.database.saveGroup(jid, { welcomeMessage });
        
        await bot.sendMessage(jid, {
          text: `✅ *Mensaje de bienvenida configurado:*\n\n${welcomeMessage}\n\n*Variables disponibles:*\n• {user} - Nombre del usuario\n• {group} - Nombre del grupo`
        });
      }
    },

    {
      name: 'setfarewell',
      description: 'Configurar mensaje de despedida personalizado',
      usage: '.setfarewell <mensaje>',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona un mensaje de despedida.\nEjemplo: .setfarewell Hasta luego {user}!' 
          });
        }

        const farewellMessage = args.join(' ');
        await bot.database.saveGroup(jid, { farewellMessage });
        
        await bot.sendMessage(jid, {
          text: `✅ *Mensaje de despedida configurado:*\n\n${farewellMessage}`
        });
      }
    },

    {
      name: 'antilink',
      description: 'Activar/desactivar protección anti-enlaces',
      usage: '.antilink <on/off>',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          const groupData = await bot.database.getGroup(jid);
          const status = groupData.antilink ? 'Activado' : 'Desactivado';
          return bot.sendMessage(jid, { 
            text: `🔗 *Anti-Enlaces:* ${status}\n\nUso: .antilink <on/off>` 
          });
        }

        const action = args[0].toLowerCase();
        const enabled = action === 'on' || action === 'activar';
        
        await bot.database.saveGroup(jid, { antilink: enabled });
        
        await bot.sendMessage(jid, {
          text: `🔗 *Anti-Enlaces ${enabled ? 'Activado' : 'Desactivado'}*\n\n${enabled ? '✅ Los enlaces serán eliminados automáticamente' : '❌ Los enlaces están permitidos'}`
        });
      }
    },

    {
      name: 'setrules',
      description: 'Establecer reglas del grupo',
      usage: '.setrules <reglas>',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona las reglas del grupo.\nEjemplo: .setrules 1. Respeto mutuo\n2. No spam\n3. Mantener el tema' 
          });
        }

        const rules = args.join(' ');
        await bot.database.saveGroup(jid, { rules });
        
        await bot.sendMessage(jid, {
          text: `📋 *Reglas del grupo establecidas:*\n\n${rules}`
        });
      }
    },

    {
      name: 'rules',
      description: 'Mostrar las reglas del grupo',
      usage: '.rules',
      category: 'general',
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid } = messageInfo;
        const groupData = await bot.database.getGroup(jid);
        
        if (!groupData.rules) {
          return bot.sendMessage(jid, { 
            text: '📋 No hay reglas establecidas para este grupo.\n\nLos administradores pueden usar .setrules para establecerlas.' 
          });
        }

        await bot.sendMessage(jid, {
          text: `📋 *Reglas del Grupo:*\n\n${groupData.rules}`
        });
      }
    },

    {
      name: 'tagall',
      description: 'Mencionar a todos los miembros del grupo',
      usage: '.tagall [mensaje]',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        try {
          const groupMetadata = await bot.sock.groupMetadata(jid);
          const participants = groupMetadata.participants.map(p => p.id);
          
          const message = args.length > 0 ? args.join(' ') : '📢 *Atención todos los miembros*';
          
          await bot.sendMessage(jid, {
            text: `${message}\n\n${participants.map(p => `@${p.split('@')[0]}`).join(' ')}`,
            mentions: participants
          });
        } catch (error) {
          await bot.sendMessage(jid, { text: '❌ Error al obtener los miembros del grupo.' });
        }
      }
    },

    {
      name: 'hidetag',
      description: 'Enviar mensaje anónimo mencionando a todos',
      usage: '.hidetag <mensaje>',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona un mensaje para enviar.\nEjemplo: .hidetag Recordatorio importante' 
          });
        }

        try {
          const groupMetadata = await bot.sock.groupMetadata(jid);
          const participants = groupMetadata.participants.map(p => p.id);
          
          await bot.sendMessage(jid, {
            text: args.join(' '),
            mentions: participants
          });
        } catch (error) {
          await bot.sendMessage(jid, { text: '❌ Error al enviar el mensaje.' });
        }
      }
    },

    {
      name: 'groupinfo',
      description: 'Información detallada del grupo',
      usage: '.groupinfo',
      category: 'info',
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid } = messageInfo;
        
        try {
          const groupMetadata = await bot.sock.groupMetadata(jid);
          const groupData = await bot.database.getGroup(jid);
          
          const admins = groupMetadata.participants.filter(p => p.admin).length;
          const members = groupMetadata.participants.length;
          const creationDate = new Date(groupMetadata.creation * 1000).toLocaleDateString();
          
          const info = `📋 *Información del Grupo*\n\n` +
                      `📌 *Nombre:* ${groupMetadata.subject}\n` +
                      `👥 *Miembros:* ${members}\n` +
                      `👑 *Administradores:* ${admins}\n` +
                      `📅 *Creado:* ${creationDate}\n` +
                      `🆔 *ID:* ${jid}\n` +
                      `🔗 *Anti-Enlaces:* ${groupData.antilink ? 'Activado' : 'Desactivado'}\n` +
                      `📋 *Reglas:* ${groupData.rules ? 'Establecidas' : 'No establecidas'}`;
          
          await bot.sendMessage(jid, { text: info });
        } catch (error) {
          await bot.sendMessage(jid, { text: '❌ Error al obtener información del grupo.' });
        }
      }
    },

    {
      name: 'clearwarns',
      description: 'Limpiar advertencias de un usuario',
      usage: '.clearwarns @usuario',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, message } = messageInfo;
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
          return bot.sendMessage(jid, { text: '❌ Menciona al usuario cuyas advertencias deseas limpiar.' });
        }

        const targetUser = mentioned[0];
        bot.groupManager.clearUserWarnings(jid, targetUser);
        
        await bot.sendMessage(jid, {
          text: `✅ Advertencias limpiadas para @${targetUser.split('@')[0]}`,
          mentions: [targetUser]
        });
      }
    },

    {
      name: 'listwarns',
      description: 'Ver advertencias de usuarios',
      usage: '.listwarns [@usuario]',
      category: 'admin',
      adminOnly: true,
      groupOnly: true,
      execute: async (bot, messageInfo) => {
        const { jid, message } = messageInfo;
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (mentioned && mentioned.length > 0) {
          const targetUser = mentioned[0];
          const warnings = bot.groupManager.getUserWarnings(jid, targetUser);
          const maxWarnings = bot.settings.groups.maxWarnings;
          
          await bot.sendMessage(jid, {
            text: `⚠️ *Advertencias de @${targetUser.split('@')[0]}:*\n\n${warnings}/${maxWarnings}`,
            mentions: [targetUser]
          });
        } else {
          // Lista general de usuarios con advertencias
          let warnList = '⚠️ *Lista de Advertencias del Grupo:*\n\n';
          let hasWarnings = false;
          
          try {
            const groupMetadata = await bot.sock.groupMetadata(jid);
            
            for (const participant of groupMetadata.participants) {
              const warnings = bot.groupManager.getUserWarnings(jid, participant.id);
              if (warnings > 0) {
                warnList += `• @${participant.id.split('@')[0]}: ${warnings}/${bot.settings.groups.maxWarnings}\n`;
                hasWarnings = true;
              }
            }
            
            if (!hasWarnings) {
              warnList += '✅ No hay usuarios con advertencias.';
            }
            
            await bot.sendMessage(jid, { text: warnList });
          } catch (error) {
            await bot.sendMessage(jid, { text: '❌ Error al obtener la lista de advertencias.' });
          }
        }
      }
    }
  ],
  
  onLoad: (bot) => {
    console.log(`[Plugin] ${this.name} v${this.version} cargado - 10 comandos de administración`);
  }
};
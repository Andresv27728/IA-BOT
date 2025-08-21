// Example Plugin for ADMIN Bot
// This file shows how to create custom plugins

export default {
  name: 'ExamplePlugin',
  version: '1.0.0',
  description: 'Plugin de ejemplo para mostrar cómo crear comandos personalizados',
  
  commands: [
    {
      name: 'hola',
      description: 'Saluda al usuario',
      usage: '.hola [nombre]',
      category: 'general',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        const name = args[0] || 'usuario';
        
        await bot.sendMessage(jid, {
          text: `¡Hola ${name}! 👋\n\nEste es un comando de ejemplo creado con el sistema de plugins de ADMIN Bot.`
        });
      }
    },
    
    {
      name: 'stats',
      description: 'Mostrar estadísticas del servidor',
      usage: '.stats',
      category: 'info',
      execute: async (bot, messageInfo) => {
        const { jid } = messageInfo;
        
        const stats = `📊 *Estadísticas del Servidor*\n\n` +
                     `💾 *Memoria:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
                     `⏱️ *Uptime:* ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m\n` +
                     `🔧 *Node.js:* ${process.version}\n` +
                     `📱 *Plataforma:* ${process.platform}\n` +
                     `🏗️ *Arquitectura:* ${process.arch}`;
        
        await bot.sendMessage(jid, { text: stats });
      }
    },
    
    {
      name: 'random',
      description: 'Generar número aleatorio',
      usage: '.random [min] [max]',
      category: 'games',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        const min = parseInt(args[0]) || 1;
        const max = parseInt(args[1]) || 100;
        
        if (min >= max) {
          return bot.sendMessage(jid, { 
            text: '❌ El número mínimo debe ser menor que el máximo.' 
          });
        }
        
        const random = Math.floor(Math.random() * (max - min + 1)) + min;
        
        await bot.sendMessage(jid, {
          text: `🎲 *Número aleatorio*\n\nRango: ${min} - ${max}\nResultado: **${random}**`
        });
      }
    }
  ],
  
  // Plugin initialization
  onLoad: (bot) => {
    console.log(`[Plugin] ${this.name} v${this.version} cargado`);
  },
  
  // Plugin cleanup
  onUnload: (bot) => {
    console.log(`[Plugin] ${this.name} descargado`);
  }
};
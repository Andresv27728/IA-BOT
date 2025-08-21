import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';

// Ensure logs directory exists
await fs.ensureDir('./logs');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname'
        }
      },
      {
        target: 'pino/file',
        options: {
          destination: './logs/bot.log',
          mkdir: true
        }
      }
    ]
  }
});

export default logger;
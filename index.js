import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import WhatsAppBot from './src/bot/WhatsAppBot.js';
import { loadSettings } from './src/utils/settings.js';
import logger from './src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Load settings
const settings = loadSettings();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: bot ? bot.getStatus() : 'disconnected',
    uptime: process.uptime()
  });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

let bot;

// Initialize WhatsApp Bot
async function initBot() {
  try {
    bot = new WhatsAppBot(settings, io);
    await bot.initialize();
    logger.info('Bot initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize bot:', error);
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info('Client connected to web interface');
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from web interface');
  });

  socket.on('restart-bot', async () => {
    if (bot) {
      await bot.restart();
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  logger.info(`🚀 ADMIN Bot server running on port ${PORT}`);
  logger.info(`📱 Web interface: http://localhost:${PORT}`);
  await initBot();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  if (bot) {
    await bot.disconnect();
  }
  server.close(() => {
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
});
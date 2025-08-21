// Download Commands Plugin - YouTube Search and Download
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  name: 'DownloadCommandsPlugin',
  version: '1.0.0',
  description: 'Plugin de comandos de descarga con yt-search y ytdl-core',
  
  commands: [
    {
      name: 'play',
      description: 'Buscar y reproducir música de YouTube',
      usage: '.play <nombre de la canción>',
      category: 'media',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona el nombre de la canción.\nEjemplo: .play Bad Bunny Tití Me Preguntó' 
          });
        }

        const query = args.join(' ');
        
        try {
          // Enviar mensaje de búsqueda
          await bot.sendMessage(jid, { text: `🔍 Buscando: *${query}*...` });
          
          // Buscar en YouTube
          const results = await yts(query);
          const video = results.videos[0];
          
          if (!video) {
            return bot.sendMessage(jid, { text: '❌ No se encontraron resultados.' });
          }

          // Verificar duración (máximo 10 minutos)
          const maxDuration = 10 * 60; // 10 minutos en segundos
          if (video.seconds > maxDuration) {
            return bot.sendMessage(jid, { 
              text: `❌ El video es demasiado largo (${video.timestamp}).\nMáximo permitido: 10 minutos.` 
            });
          }

          // Información del video
          const info = `🎵 *Encontrado:*\n\n` +
                      `📌 *Título:* ${video.title}\n` +
                      `👤 *Canal:* ${video.author.name}\n` +
                      `⏱️ *Duración:* ${video.timestamp}\n` +
                      `👀 *Vistas:* ${video.views.toLocaleString()}\n` +
                      `🔗 *URL:* ${video.url}\n\n` +
                      `📥 Descargando audio...`;

          await bot.sendMessage(jid, { text: info });

          // Descargar audio
          const audioPath = path.join(__dirname, '../temp', `${Date.now()}.mp3`);
          await fs.ensureDir(path.dirname(audioPath));

          const stream = ytdl(video.url, {
            filter: 'audioonly',
            quality: 'highestaudio'
          });

          const writeStream = fs.createWriteStream(audioPath);
          stream.pipe(writeStream);

          writeStream.on('finish', async () => {
            try {
              // Verificar tamaño del archivo
              const stats = await fs.stat(audioPath);
              const fileSizeInMB = stats.size / (1024 * 1024);
              
              if (fileSizeInMB > 50) {
                await fs.remove(audioPath);
                return bot.sendMessage(jid, { 
                  text: '❌ El archivo es demasiado grande (>50MB).' 
                });
              }

              // Enviar audio
              const audioBuffer = await fs.readFile(audioPath);
              
              await bot.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                  externalAdReply: {
                    title: video.title,
                    body: video.author.name,
                    mediaType: 2,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url
                  }
                }
              });

              // Limpiar archivo temporal
              await fs.remove(audioPath);
              
            } catch (error) {
              console.error('Error sending audio:', error);
              await bot.sendMessage(jid, { text: '❌ Error al enviar el audio.' });
              await fs.remove(audioPath);
            }
          });

          stream.on('error', async (error) => {
            console.error('Download error:', error);
            await bot.sendMessage(jid, { text: '❌ Error al descargar el audio.' });
            await fs.remove(audioPath);
          });

        } catch (error) {
          console.error('Play command error:', error);
          await bot.sendMessage(jid, { 
            text: '❌ Error al buscar o descargar la música.' 
          });
        }
      }
    },

    {
      name: 'ytsearch',
      description: 'Buscar videos en YouTube',
      usage: '.ytsearch <consulta>',
      category: 'media',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona una consulta de búsqueda.\nEjemplo: .ytsearch JavaScript tutorial' 
          });
        }

        const query = args.join(' ');
        
        try {
          await bot.sendMessage(jid, { text: `🔍 Buscando: *${query}*...` });
          
          const results = await yts(query);
          
          if (!results.videos || results.videos.length === 0) {
            return bot.sendMessage(jid, { text: '❌ No se encontraron resultados.' });
          }

          let resultText = `🔍 *Resultados para:* ${query}\n\n`;
          
          // Mostrar los primeros 5 resultados
          results.videos.slice(0, 5).forEach((video, index) => {
            resultText += `${index + 1}. *${video.title}*\n` +
                         `👤 ${video.author.name}\n` +
                         `⏱️ ${video.timestamp} | 👀 ${video.views.toLocaleString()}\n` +
                         `🔗 ${video.url}\n\n`;
          });

          resultText += `💡 *Tip:* Usa .play <nombre> para descargar audio`;

          await bot.sendMessage(jid, { text: resultText });
          
        } catch (error) {
          console.error('YTSearch error:', error);
          await bot.sendMessage(jid, { 
            text: '❌ Error al realizar la búsqueda en YouTube.' 
          });
        }
      }
    },

    {
      name: 'ytdl',
      description: 'Descargar video de YouTube por URL',
      usage: '.ytdl <URL de YouTube>',
      category: 'media',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona una URL válida de YouTube.\nEjemplo: .ytdl https://youtube.com/watch?v=...' 
          });
        }

        const url = args[0];
        
        if (!ytdl.validateURL(url)) {
          return bot.sendMessage(jid, { text: '❌ URL de YouTube inválida.' });
        }

        try {
          await bot.sendMessage(jid, { text: '📋 Obteniendo información del video...' });
          
          const info = await ytdl.getInfo(url);
          const video = info.videoDetails;
          
          // Verificar duración (máximo 15 minutos para descarga directa)
          const maxDuration = 15 * 60; // 15 minutos
          if (parseInt(video.lengthSeconds) > maxDuration) {
            return bot.sendMessage(jid, { 
              text: `❌ El video es demasiado largo (${Math.floor(video.lengthSeconds / 60)}:${video.lengthSeconds % 60}).\nMáximo permitido: 15 minutos.` 
            });
          }

          const videoInfo = `📹 *Video encontrado:*\n\n` +
                           `📌 *Título:* ${video.title}\n` +
                           `👤 *Canal:* ${video.author.name}\n` +
                           `⏱️ *Duración:* ${Math.floor(video.lengthSeconds / 60)}:${(video.lengthSeconds % 60).toString().padStart(2, '0')}\n` +
                           `👀 *Vistas:* ${parseInt(video.viewCount).toLocaleString()}\n` +
                           `📅 *Publicado:* ${video.publishDate}\n\n` +
                           `📥 Preparando descarga...`;

          await bot.sendMessage(jid, { text: videoInfo });

          // Descargar audio (más confiable que video)
          const audioPath = path.join(__dirname, '../temp', `${Date.now()}_${video.videoId}.mp3`);
          await fs.ensureDir(path.dirname(audioPath));

          const stream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
          });

          const writeStream = fs.createWriteStream(audioPath);
          stream.pipe(writeStream);

          writeStream.on('finish', async () => {
            try {
              const stats = await fs.stat(audioPath);
              const fileSizeInMB = stats.size / (1024 * 1024);
              
              if (fileSizeInMB > 50) {
                await fs.remove(audioPath);
                return bot.sendMessage(jid, { 
                  text: '❌ El archivo es demasiado grande (>50MB).' 
                });
              }

              await bot.sendMessage(jid, { text: '📤 Enviando archivo...' });

              const audioBuffer = await fs.readFile(audioPath);
              
              await bot.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                  externalAdReply: {
                    title: video.title,
                    body: `${video.author.name} • ${Math.floor(video.lengthSeconds / 60)}:${(video.lengthSeconds % 60).toString().padStart(2, '0')}`,
                    mediaType: 2,
                    thumbnailUrl: video.thumbnails[0]?.url,
                    sourceUrl: url
                  }
                }
              });

              await fs.remove(audioPath);
              
            } catch (error) {
              console.error('Error sending downloaded file:', error);
              await bot.sendMessage(jid, { text: '❌ Error al enviar el archivo descargado.' });
              await fs.remove(audioPath);
            }
          });

          stream.on('error', async (error) => {
            console.error('Download error:', error);
            await bot.sendMessage(jid, { text: '❌ Error al descargar el archivo.' });
            await fs.remove(audioPath);
          });

        } catch (error) {
          console.error('YTDL error:', error);
          await bot.sendMessage(jid, { 
            text: '❌ Error al procesar la URL. Verifica que sea un enlace válido de YouTube.' 
          });
        }
      }
    },

    {
      name: 'ytmp3',
      description: 'Descargar solo audio de YouTube',
      usage: '.ytmp3 <nombre o URL>',
      category: 'media',
      execute: async (bot, messageInfo) => {
        const { jid, args } = messageInfo;
        
        if (args.length === 0) {
          return bot.sendMessage(jid, { 
            text: '❌ Proporciona el nombre de la canción o URL.\nEjemplo: .ytmp3 Imagine Dragons Believer' 
          });
        }

        const query = args.join(' ');
        
        try {
          await bot.sendMessage(jid, { text: `🎵 Procesando: *${query}*...` });
          
          let videoUrl;
          
          // Verificar si es una URL o buscar
          if (ytdl.validateURL(query)) {
            videoUrl = query;
          } else {
            const results = await yts(query);
            if (!results.videos || results.videos.length === 0) {
              return bot.sendMessage(jid, { text: '❌ No se encontraron resultados.' });
            }
            videoUrl = results.videos[0].url;
          }

          const info = await ytdl.getInfo(videoUrl);
          const video = info.videoDetails;
          
          if (parseInt(video.lengthSeconds) > 600) { // 10 minutos
            return bot.sendMessage(jid, { 
              text: '❌ La canción es demasiado larga (máximo 10 minutos).' 
            });
          }

          await bot.sendMessage(jid, { 
            text: `🎵 Descargando: *${video.title}*\n👤 Por: ${video.author.name}` 
          });

          const audioPath = path.join(__dirname, '../temp', `${Date.now()}_audio.mp3`);
          await fs.ensureDir(path.dirname(audioPath));

          const stream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio'
          });

          const writeStream = fs.createWriteStream(audioPath);
          stream.pipe(writeStream);

          writeStream.on('finish', async () => {
            try {
              const audioBuffer = await fs.readFile(audioPath);
              
              await bot.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${video.title}.mp3`,
                contextInfo: {
                  externalAdReply: {
                    title: video.title,
                    body: video.author.name,
                    mediaType: 2,
                    thumbnailUrl: video.thumbnails[0]?.url,
                    sourceUrl: videoUrl
                  }
                }
              });

              await fs.remove(audioPath);
              
            } catch (error) {
              console.error('Error sending MP3:', error);
              await bot.sendMessage(jid, { text: '❌ Error al enviar el audio.' });
              await fs.remove(audioPath);
            }
          });

        } catch (error) {
          console.error('YTMP3 error:', error);
          await bot.sendMessage(jid, { 
            text: '❌ Error al descargar el audio.' 
          });
        }
      }
    }
  ],
  
  onLoad: (bot) => {
    console.log(`[Plugin] ${this.name} v${this.version} cargado - Comandos de descarga YouTube`);
  }
};
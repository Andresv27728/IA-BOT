import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  MessageCircle, 
  Users, 
  Settings, 
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface BotStatus {
  status: string;
  retries?: number;
  uptime: number;
}

interface BotInfo {
  name: string;
  number: string;
  status: string;
}

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [botStatus, setBotStatus] = useState<BotStatus>({ status: 'disconnected', uptime: 0 });
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      fetchBotStatus();
      fetchSettings();
    });

    newSocket.on('qr-code', (data: { qr: string; retries: number }) => {
      setQrCode(data.qr);
      setIsConnecting(true);
    });

    newSocket.on('bot-connected', (data: BotInfo) => {
      setBotInfo(data);
      setBotStatus({ status: 'connected', uptime: 0 });
      setQrCode('');
      setIsConnecting(false);
    });

    newSocket.on('bot-disconnected', () => {
      setBotStatus({ status: 'disconnected', uptime: 0 });
      setBotInfo(null);
      setIsConnecting(false);
    });

    newSocket.on('qr-expired', () => {
      setQrCode('');
      setIsConnecting(false);
    });

    newSocket.on('session-expired', () => {
      setQrCode('');
      setIsConnecting(false);
    });

    newSocket.on('logged-out', () => {
      setBotStatus({ status: 'logged-out', uptime: 0 });
      setBotInfo(null);
      setQrCode('');
      setIsConnecting(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const status = await response.json();
      setBotStatus(status);
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const settingsData = await response.json();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const restartBot = () => {
    if (socket) {
      socket.emit('restart-bot');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      case 'logged-out': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando';
      case 'disconnected': return 'Desconectado';
      case 'logged-out': return 'Sesión Cerrada';
      default: return 'Desconocido';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🤖 {settings.bot.name} Dashboard
          </h1>
          <p className="text-gray-600">Panel de Control del Bot de WhatsApp</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado del Bot</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(botStatus.status)}`}></div>
                <Badge variant={botStatus.status === 'connected' ? 'default' : 'secondary'}>
                  {getStatusText(botStatus.status)}
                </Badge>
              </div>
              {botInfo && (
                <p className="text-xs text-muted-foreground mt-1">
                  📱 {botInfo.number}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Activo</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUptime(botStatus.uptime)}</div>
              <p className="text-xs text-muted-foreground">
                Desde el último reinicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prefijo</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{settings.bot.prefix}</div>
              <p className="text-xs text-muted-foreground">
                Prefijo de comandos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propietario</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">+{settings.bot.owner}</div>
              <p className="text-xs text-muted-foreground">
                Número del propietario
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="connection" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Conexión</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="features">Funciones</TabsTrigger>
            <TabsTrigger value="logs">Registros</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Estado de Conexión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrCode ? (
                  <div className="text-center space-y-4">
                    <Alert>
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription>
                        Escanea el código QR con WhatsApp para conectar el bot
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-center">
                      <img 
                        src={qrCode} 
                        alt="QR Code" 
                        className="border border-gray-300 rounded-lg shadow-lg max-w-xs"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reintentos: {botStatus.retries || 0}/5
                    </p>
                  </div>
                ) : botStatus.status === 'connected' ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-green-100">
                        <Wifi className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-600">
                        ✅ Bot Conectado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        El bot está funcionando correctamente
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-red-100">
                        <WifiOff className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-600">
                        ❌ Bot Desconectado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        El bot no está conectado a WhatsApp
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-2">
                  <Button onClick={restartBot} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reiniciar Bot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Bot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Nombre:</span>
                    <span className="text-sm font-medium">{settings.bot.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Prefijo:</span>
                    <span className="text-sm font-medium">{settings.bot.prefix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Idioma:</span>
                    <span className="text-sm font-medium">{settings.bot.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Zona Horaria:</span>
                    <span className="text-sm font-medium">{settings.bot.timezone}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Grupos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Máx. Advertencias:</span>
                    <span className="text-sm font-medium">{settings.groups.maxWarnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Anti-Flood:</span>
                    <Badge variant={settings.groups.antiFlood ? 'default' : 'secondary'}>
                      {settings.groups.antiFlood ? 'Activado' : 'Desactivado'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Solo Admin:</span>
                    <Badge variant={settings.groups.adminOnly ? 'default' : 'secondary'}>
                      {settings.groups.adminOnly ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(settings.features).map(([feature, enabled]) => (
                <Card key={feature}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={enabled ? 'default' : 'secondary'}>
                      {enabled ? 'Activado' : 'Desactivado'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registros del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-green-600">[INFO]</span> Bot iniciado correctamente
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-blue-600">[DEBUG]</span> Plugins cargados: {Object.keys(settings.features).length}
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-green-600">[INFO]</span> Base de datos inicializada
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
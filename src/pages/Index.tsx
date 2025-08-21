import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Users, 
  Gamepad2, 
  Shield, 
  Sticker, 
  Music,
  Settings,
  Play,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function WelcomePage() {
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Administración de Grupos",
      description: "Control completo de grupos con comandos de moderación"
    },
    {
      icon: <Sticker className="h-6 w-6" />,
      title: "Creación de Stickers",
      description: "Convierte imágenes en stickers automáticamente"
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: "Reproducción de Audio",
      description: "Descarga y reproduce música desde múltiples fuentes"
    },
    {
      icon: <Gamepad2 className="h-6 w-6" />,
      title: "Juegos Interactivos",
      description: "Entretenimiento con dados, monedas y más juegos"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Protección Anti-Spam",
      description: "Sistema avanzado de protección contra spam y enlaces"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Dispositivo",
      description: "Compatible con Baileys MD para múltiples dispositivos"
    }
  ];

  const techStack = [
    "Node.js", "Baileys MD", "Express.js", "Socket.IO", "React", "TypeScript"
  ];

  const deploymentPlatforms = [
    "Render", "Vercel", "Railway", "Heroku"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Main Title */}
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🤖 ADMIN
            </h1>
            <p className="text-2xl text-gray-600">Bot Avanzado de WhatsApp</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bot profesional para WhatsApp con Node.js y Baileys MD. Administración de grupos, 
              stickers, juegos, comandos personalizados y soporte multi-dispositivo.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Play className="h-5 w-5 mr-2" />
                Iniciar Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              <Settings className="h-5 w-5 mr-2" />
              Documentación
            </Button>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Multi-Dispositivo
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Compatible Render/Vercel
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Auto-Instalación
            </Badge>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas en un bot de WhatsApp profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      {feature.icon}
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Tecnologías Utilizadas
            </h2>
            <p className="text-xl text-gray-600">
              Construido con las mejores tecnologías modernas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="text-center p-4">
                <Badge variant="outline" className="text-sm">
                  {tech}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Despliegue Optimizado
            </h2>
            <p className="text-xl text-gray-600">
              Compatible con las principales plataformas de hosting
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {deploymentPlatforms.map((platform, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {platform.charAt(0)}
                    </span>
                  </div>
                  <p className="font-semibold">{platform}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Configura tu bot de WhatsApp en minutos y comienza a gestionar tus grupos de manera profesional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Play className="h-5 w-5 mr-2" />
                Abrir Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Ver Documentación
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-6 bg-gray-800 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400">
            © 2024 ADMIN Bot - Desarrollado por MGX Team
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bot avanzado de WhatsApp con soporte multi-dispositivo
          </p>
        </div>
      </div>
    </div>
  );
}
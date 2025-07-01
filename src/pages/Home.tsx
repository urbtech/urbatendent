
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Package, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            URBTECH
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de Coleta de Resíduos Eletrônicos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Chatbot
              </CardTitle>
              <CardDescription>
                Converse com nosso assistente virtual para solicitar coleta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/chatbot")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Iniciar Conversa
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Pedidos
              </CardTitle>
              <CardDescription>
                Visualize e gerencie todos os pedidos de coleta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/orders")}
                variant="outline"
                className="w-full"
              >
                Ver Pedidos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                WhatsApp
              </CardTitle>
              <CardDescription>
                Configure a integração com WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/whatsapp-config")}
                variant="outline"
                className="w-full"
              >
                Configurar WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Transformando o descarte de resíduos eletrônicos com tecnologia sustentável
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

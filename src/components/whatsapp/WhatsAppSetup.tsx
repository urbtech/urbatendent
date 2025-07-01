
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { whatsappService } from "@/services/whatsappService";
import { toast } from "@/hooks/use-toast";

const WhatsAppSetup = () => {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const webhookUrl = whatsappService.getWebhookUrl();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const testWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const success = await whatsappService.testWebhook();
      if (success) {
        toast({
          title: "Webhook funcionando!",
          description: "A integração está configurada corretamente",
        });
      } else {
        toast({
          title: "Erro no webhook",
          description: "Verifique as configurações do Supabase",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o webhook",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Configuração WhatsApp - Twilio
          </CardTitle>
          <CardDescription>
            Siga os passos abaixo para conectar seu chatbot ao WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Crie uma conta no Twilio</h3>
            <p className="text-sm text-gray-600">
              Acesse <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">twilio.com</a> e crie uma conta
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">
                Criar conta Twilio <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Configure o WhatsApp Business</h3>
            <p className="text-sm text-gray-600">
              No console do Twilio, ative o WhatsApp Business API
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noopener noreferrer">
                Configurar WhatsApp <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Configure o Webhook URL</h3>
            <p className="text-sm text-gray-600">
              Use esta URL como webhook no Twilio:
            </p>
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
              <code className="flex-1 text-sm">{webhookUrl}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">4. Configure as credenciais no Supabase</h3>
            <p className="text-sm text-gray-600">
              Adicione estas variáveis nas configurações do Supabase (Settings → Secrets):
            </p>
            <div className="space-y-1 text-sm font-mono bg-gray-100 p-3 rounded">
              <div>TWILIO_ACCOUNT_SID</div>
              <div>TWILIO_AUTH_TOKEN</div>
              <div>TWILIO_PHONE_NUMBER</div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> O número do WhatsApp deve estar no formato internacional com o prefixo whatsapp: (ex: whatsapp:+5511999999999)
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={testWebhook} disabled={isTestingWebhook}>
              {isTestingWebhook ? "Testando..." : "Testar Webhook"}
            </Button>
            <Button variant="outline" asChild>
              <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer">
                Abrir Console Twilio <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSetup;

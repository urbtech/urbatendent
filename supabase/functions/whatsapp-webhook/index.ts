
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Twilio credentials from Supabase secrets
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
)

interface WhatsAppMessage {
  From: string;
  Body: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  NumMedia: string;
}

interface ChatSession {
  phoneNumber: string;
  currentStep: string;
  orderData: any;
  createdAt: Date;
}

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, ChatSession>();

const processWhatsAppMessage = async (message: WhatsAppMessage) => {
  const phoneNumber = message.From.replace('whatsapp:', '');
  const userMessage = message.Body;
  const hasMedia = parseInt(message.NumMedia) > 0;

  // Get or create session
  let session = sessions.get(phoneNumber);
  if (!session) {
    session = {
      phoneNumber,
      currentStep: 'welcome',
      orderData: {
        customerName: '',
        type: null,
        wasteType: null,
        location: null,
        volume: null,
        photos: [],
        status: 'novo',
        createdAt: new Date(),
      },
      createdAt: new Date()
    };
    sessions.set(phoneNumber, session);
  }

  let responseMessage = '';

  // Process based on current step
  switch (session.currentStep) {
    case 'welcome':
      responseMessage = 'Olá! Sou o assistente virtual da URBTECH. Como podemos te ajudar hoje com a coleta de resíduos eletrônicos?\n\nPara começarmos, poderia me informar seu nome?';
      session.currentStep = 'ask-name';
      break;

    case 'ask-name':
      if (!userMessage.match(/^[a-zA-Z\s]+$/)) {
        responseMessage = 'Nome inválido. Use apenas letras e espaços.';
        break;
      }
      session.orderData.customerName = userMessage;
      responseMessage = `Obrigado, ${userMessage}! O resíduo que você deseja descartar é empresarial ou residencial?`;
      session.currentStep = 'ask-type';
      break;

    case 'ask-type':
      if (userMessage.toLowerCase() === 'empresarial' || userMessage.toLowerCase() === 'residencial') {
        session.orderData.type = userMessage.toLowerCase();
        responseMessage = 'Qual é o tipo de resíduo eletrônico? (Ex.: baterias, computadores)';
        session.currentStep = 'ask-waste-type';
      } else {
        responseMessage = 'Por favor, escolha "empresarial" ou "residencial".';
      }
      break;

    case 'ask-waste-type':
      session.orderData.wasteType = userMessage;
      responseMessage = 'Qual é o endereço para coleta?';
      session.currentStep = 'ask-location';
      break;

    case 'ask-location':
      session.orderData.location = userMessage;
      responseMessage = 'Qual o volume aproximado? (Ex.: 50kg, 10 unidades)';
      session.currentStep = 'ask-volume';
      break;

    case 'ask-volume':
      session.orderData.volume = userMessage;
      responseMessage = 'Por favor, envie uma foto do resíduo ou digite "pular" para finalizar sem foto.';
      session.currentStep = 'ask-photos';
      break;

    case 'ask-photos':
      if (hasMedia && message.MediaUrl0) {
        session.orderData.photos.push(message.MediaUrl0);
        responseMessage = 'Obrigado pela foto! Digite "confirmar" para finalizar seu pedido ou envie mais fotos.';
        session.currentStep = 'confirm-order';
      } else if (userMessage.toLowerCase() === 'pular') {
        responseMessage = await completeOrder(session.orderData);
        session.currentStep = 'welcome';
        resetOrderData(session);
      } else {
        responseMessage = 'Por favor, envie uma foto ou digite "pular" para continuar sem foto.';
      }
      break;

    case 'confirm-order':
      if (hasMedia && message.MediaUrl0) {
        session.orderData.photos.push(message.MediaUrl0);
        responseMessage = 'Foto adicionada! Digite "confirmar" para finalizar seu pedido ou envie mais fotos.';
      } else if (userMessage.toLowerCase() === 'confirmar') {
        responseMessage = await saveOrder(session.orderData);
        session.currentStep = 'welcome';
        resetOrderData(session);
      } else {
        responseMessage = 'Digite "confirmar" para finalizar o pedido ou envie mais fotos.';
      }
      break;

    default:
      responseMessage = 'Desculpe, não entendi. Por favor, responda conforme as opções fornecidas.';
      break;
  }

  sessions.set(phoneNumber, session);
  return responseMessage;
};

const completeOrder = async (orderData: any) => {
  const summary = `Resumo do seu pedido:
- Nome: ${orderData.customerName}
- Tipo: ${orderData.type}
- Resíduo: ${orderData.wasteType}
- Local: ${orderData.location}
- Volume: ${orderData.volume}
- Fotos: ${orderData.photos.length} anexadas

Os dados estão corretos? Digite "confirmar" para finalizar o pedido.`;
  
  return summary;
};

const saveOrder = async (orderData: any) => {
  try {
    // Create customer
    const customerResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        name: orderData.customerName,
        type: orderData.type,
        location: orderData.location
      }),
    });

    const customer = await customerResponse.json();

    // Create order
    const orderPayload = {
      customerName: orderData.customerName,
      customerId: customer.id,
      type: orderData.type,
      wasteType: orderData.wasteType,
      location: orderData.location,
      volume: orderData.volume,
      photos: orderData.photos,
      status: orderData.status,
    };

    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify(orderPayload),
    });

    return `Pedido confirmado! Entraremos em contato para agendar a coleta. Obrigado por usar a URBTECH! 🌱`;
  } catch (error) {
    console.error('Error saving order:', error);
    return 'Erro ao salvar o pedido. Tente novamente mais tarde.';
  }
};

const resetOrderData = (session: ChatSession) => {
  session.orderData = {
    customerName: '',
    type: null,
    wasteType: null,
    location: null,
    volume: null,
    photos: [],
    status: 'novo',
    createdAt: new Date(),
  };
};

const sendWhatsAppMessage = async (to: string, message: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error('Twilio credentials not configured');
    return;
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${TWILIO_PHONE_NUMBER}`);
  formData.append('To', to);
  formData.append('Body', message);

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    console.error('Failed to send WhatsApp message:', await response.text());
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method === 'POST') {
      const formData = await req.formData();
      const message: WhatsAppMessage = {
        From: formData.get('From') as string,
        Body: formData.get('Body') as string,
        MediaUrl0: formData.get('MediaUrl0') as string,
        MediaContentType0: formData.get('MediaContentType0') as string,
        NumMedia: formData.get('NumMedia') as string || '0',
      };

      console.log('Received WhatsApp message:', message);

      const responseMessage = await processWhatsAppMessage(message);
      await sendWhatsAppMessage(message.From, responseMessage);

      return new Response('Message processed', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});

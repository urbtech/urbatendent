import { useState, useEffect } from 'react';
import { Message, OrderData } from '@/types/ChatTypes';
import { customerService } from "@/services/customerService";
import { toast } from "@/hooks/use-toast";

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentStep, setCurrentStep] = useState<string>("welcome");
  const [orderData, setOrderData] = useState<OrderData>({
    customerName: "",
    type: null,
    wasteType: null,
    location: null,
    volume: null,
    photos: [],
    status: "novo",
    createdAt: new Date(),
  });

  useEffect(() => {
    const initialMessage: Message = {
      id: "welcome",
      text: "Olá! Sou o assistente virtual da URBTECH. Como podemos te ajudar hoje com a coleta de resíduos eletrônicos?",
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages([initialMessage]);
    
    setTimeout(() => {
      const followupMessage: Message = {
        id: "name-ask",
        text: "Para começarmos, poderia me informar seu nome?",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, followupMessage]);
      setCurrentStep("ask-name");
    }, 1000);
  }, []);

  const processUserResponse = (userInput: string) => {
    const botResponses: Message[] = [];
    const updatedOrderData = { ...orderData };

    switch (currentStep) {
      case "ask-name":
        updatedOrderData.customerName = userInput;
        botResponses.push({
          id: Date.now().toString(),
          text: `Obrigado, ${userInput}! O resíduo que você deseja descartar é empresarial ou residencial?`,
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-type");
        break;

      case "ask-type":
        const wasteType = userInput.toLowerCase().includes("empresa") ? "empresarial" : "residencial";
        updatedOrderData.type = wasteType as "empresarial" | "residencial";
        botResponses.push({
          id: Date.now().toString(),
          text: `Entendi! Qual é o tipo de resíduo eletrônico que você precisa descartar? (ex: computadores, celulares, baterias, etc.)`,
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-waste-type");
        break;

      case "ask-waste-type":
        updatedOrderData.wasteType = userInput;
        botResponses.push({
          id: Date.now().toString(),
          text: `Ótimo! Agora, poderia me informar a sua localidade? (cidade/bairro)`,
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-location");
        break;

      case "ask-location":
        updatedOrderData.location = userInput;
        botResponses.push({
          id: Date.now().toString(),
          text: `Perfeito! E qual seria o volume aproximado? (ex: 2 computadores, 5kg de cabos, etc.)`,
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-volume");
        break;

      case "ask-volume":
        updatedOrderData.volume = userInput;
        botResponses.push({
          id: Date.now().toString(),
          text: `Quase lá! Seria ótimo se você pudesse enviar fotos dos resíduos para melhor avaliação. Você pode anexar fotos agora ou pular esta etapa.`,
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-photos");
        break;

      case "ask-photos":
        if (userInput.toLowerCase().includes("pular")) {
          completeOrder(updatedOrderData);
        } else {
          botResponses.push({
            id: Date.now().toString(),
            text: `Por favor, anexe as fotos usando o botão de câmera abaixo.`,
            sender: "bot",
            timestamp: new Date(),
          });
          // Mantém o mesmo passo para esperar as fotos
        }
        break;

      case "confirm-order":
        if (userInput.toLowerCase().includes("sim")) {
          botResponses.push({
            id: Date.now().toString(),
            text: `Pedido confirmado! Seu código de acompanhamento é #${Math.floor(1000 + Math.random() * 9000)}. Nossa equipe entrará em contato em breve para agendar a coleta.`,
            sender: "bot",
            timestamp: new Date(),
          });
          
          saveOrder(updatedOrderData);
          
          setTimeout(() => {
            botResponses.push({
              id: Date.now().toString(),
              text: `Posso ajudar com mais alguma coisa?`,
              sender: "bot",
              timestamp: new Date(),
            });
            setCurrentStep("welcome");
          }, 2000);
        } else {
          botResponses.push({
            id: Date.now().toString(),
            text: `Sem problemas! Vamos reiniciar o processo. O resíduo que você deseja descartar é empresarial ou residencial?`,
            sender: "bot",
            timestamp: new Date(),
          });
          setCurrentStep("ask-type");
        }
        break;

      default:
        botResponses.push({
          id: Date.now().toString(),
          text: `Para iniciar um pedido de coleta, posso te ajudar agora mesmo. Qual é o seu nome?`,
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-name");
    }

    setOrderData(updatedOrderData);
    
    if (botResponses.length > 0) {
      setTimeout(() => {
        setMessages(prev => [...prev, ...botResponses]);
      }, 500);
    }
  };

  const saveOrder = (data: OrderData) => {
    const customer = customerService.create(
      data.customerName,
      data.type!,
      data.location!
    );

    const existingOrders = JSON.parse(localStorage.getItem("urbtech_orders") || "[]");
    
    const newOrder = {
      ...data,
      id: Date.now().toString(),
      customerId: customer.id,
      createdAt: new Date().toISOString(),
    };
    
    const updatedOrders = [newOrder, ...existingOrders];
    
    localStorage.setItem("urbtech_orders", JSON.stringify(updatedOrders));
    
    toast({
      title: "Pedido registrado",
      description: `O pedido de ${data.customerName} foi registrado com sucesso!`,
    });
  };

  const completeOrder = (data: OrderData) => {
    const summary = `
      Resumo do seu pedido:
      - Nome: ${data.customerName}
      - Tipo: ${data.type}
      - Resíduo: ${data.wasteType}
      - Local: ${data.location}
      - Volume: ${data.volume}
      - Fotos: ${data.photos.length} anexadas
    `;

    setTimeout(() => {
      const summaryMessage: Message = {
        id: Date.now().toString(),
        text: summary,
        sender: "bot",
        timestamp: new Date(),
      };
      
      const confirmMessage: Message = {
        id: Date.now().toString(),
        text: "Os dados estão corretos? Responda com 'sim' para confirmar ou 'não' para reiniciar.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, summaryMessage, confirmMessage]);
      setCurrentStep("confirm-order");
    }, 500);
  };

  return {
    messages,
    currentMessage,
    setCurrentMessage,
    currentStep,
    setCurrentStep,
    orderData,
    setOrderData,
    processUserResponse,
    saveOrder
  };
};

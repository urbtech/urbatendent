
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
        if (!userInput.match(/^[a-zA-Z\s]+$/)) {
          botResponses.push({
            id: Date.now().toString(),
            text: "Nome inválido. Use apenas letras e espaços.",
            sender: "bot",
            timestamp: new Date(),
          });
          break;
        }
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
        if (userInput.toLowerCase() === "empresarial" || userInput.toLowerCase() === "residencial") {
          updatedOrderData.type = userInput.toLowerCase() as "empresarial" | "residencial";
          botResponses.push({
            id: Date.now().toString(),
            text: "Qual é o tipo de resíduo eletrônico? (Ex.: baterias, computadores)",
            sender: "bot",
            timestamp: new Date(),
          });
          setCurrentStep("ask-waste-type");
        } else {
          botResponses.push({
            id: Date.now().toString(),
            text: "Por favor, escolha 'empresarial' ou 'residencial'.",
            sender: "bot",
            timestamp: new Date(),
          });
        }
        break;

      case "ask-waste-type":
        updatedOrderData.wasteType = userInput;
        botResponses.push({
          id: Date.now().toString(),
          text: "Qual é o endereço para coleta?",
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-location");
        break;

      case "ask-location":
        updatedOrderData.location = userInput;
        botResponses.push({
          id: Date.now().toString(),
          text: "Qual o volume aproximado? (Ex.: 50kg, 10 unidades)",
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-volume");
        break;

      case "ask-volume":
        updatedOrderData.volume = userInput;
        botResponses.push({
          id: Date.now().toString(),
          text: "Por favor, envie uma foto do resíduo usando o botão da câmera, ou digite 'pular' para finalizar sem foto.",
          sender: "bot",
          timestamp: new Date(),
        });
        setCurrentStep("ask-photos");
        break;

      case "ask-photos":
        if (userInput.toLowerCase() === "pular") {
          completeOrder(updatedOrderData);
        } else {
          botResponses.push({
            id: Date.now().toString(),
            text: "Por favor, use o botão da câmera para anexar a foto ou digite 'pular' para continuar sem foto.",
            sender: "bot",
            timestamp: new Date(),
          });
        }
        break;

      case "confirm-order":
        if (userInput.toLowerCase() === "confirmar") {
          saveOrder(updatedOrderData);
          botResponses.push({
            id: Date.now().toString(),
            text: "Pedido confirmado! Entraremos em contato para agendar a coleta.",
            sender: "bot",
            timestamp: new Date(),
          });
          setCurrentStep("welcome");
          setOrderData({
            customerName: "",
            type: null,
            wasteType: null,
            location: null,
            volume: null,
            photos: [],
            status: "novo",
            createdAt: new Date(),
          });
        } else {
          botResponses.push({
            id: Date.now().toString(),
            text: "Deseja revisar os dados ou enviar mais fotos?",
            sender: "bot",
            timestamp: new Date(),
          });
        }
        break;

      default:
        botResponses.push({
          id: Date.now().toString(),
          text: "Desculpe, não entendi. Por favor, responda conforme as opções fornecidas.",
          sender: "bot",
          timestamp: new Date(),
        });
        break;
    }

    setOrderData(updatedOrderData);
    
    if (botResponses.length > 0) {
      setTimeout(() => {
        setMessages(prev => [...prev, ...botResponses]);
      }, 500);
    }
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
        text: "Os dados estão corretos? Digite 'confirmar' para finalizar o pedido.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, summaryMessage, confirmMessage]);
      setCurrentStep("confirm-order");
    }, 500);
  };

  const saveOrder = async (data: OrderData) => {
    try {
      const customer = customerService.create(
        data.customerName,
        data.type!,
        data.location!
      );

      const newOrder = {
        ...data,
        id: Date.now().toString(),
        customerId: customer.id,
        createdAt: new Date().toISOString(),
      };

      // Substituir localStorage por API ou banco
      const existingOrders = JSON.parse(localStorage.getItem("urbtech_orders") || "[]");
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem("urbtech_orders", JSON.stringify(updatedOrders));

      toast({
        title: "Pedido registrado",
        description: `O pedido de ${data.customerName} foi registrado com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar o pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    setMessages,
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

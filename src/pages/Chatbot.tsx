import React, { useState, useRef, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Camera, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerService } from "@/services/customerService";

type Message = {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
};

type AttachmentType = {
  type: "image";
  url: string;
};

type OrderData = {
  customerName: string;
  type: "empresarial" | "residencial" | null;
  wasteType: string | null;
  location: string | null;
  volume: string | null;
  photos: string[];
  status: "novo" | "em andamento" | "concluído";
  createdAt: Date;
};

const Chatbot = () => {
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
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = () => {
    if (currentMessage.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage("");
    
    setTimeout(() => {
      processUserResponse(newUserMessage.text);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleAttachPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        
        const newImageMessage: Message = {
          id: Date.now().toString(),
          text: "📷 Imagem enviada",
          sender: "user",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newImageMessage]);
        
        setAttachments(prev => [...prev, { type: "image", url: dataUrl }]);
        
        const updatedOrderData = { ...orderData };
        updatedOrderData.photos = [...updatedOrderData.photos, dataUrl];
        setOrderData(updatedOrderData);
        
        if (currentStep === "ask-photos") {
          setTimeout(() => {
            const responseMessage: Message = {
              id: Date.now().toString(),
              text: "Obrigado pela foto! Deseja enviar mais fotos ou podemos confirmar seu pedido?",
              sender: "bot",
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, responseMessage]);
            setCurrentStep("confirm-order");
          }, 500);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
        text: "Os dados estão corretos? Responda com 'sim' para confirmar ou 'não' para reiniciar.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, summaryMessage, confirmMessage]);
      setCurrentStep("confirm-order");
    }, 500);
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

  const navigateToOrdersPage = () => {
    navigate("/orders");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F0F2F5] overflow-hidden">
      <div className="bg-[#128C7E] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mr-3">
            <User size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">URBTECH</h1>
            <p className="text-xs">Coleta de resíduos eletrônicos</p>
          </div>
        </div>
        <Button
          variant="ghost" 
          className="text-white hover:bg-white/20"
          onClick={navigateToOrdersPage}
        >
          Ver Pedidos
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-[#E5DDD5]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 max-w-[80%] ${
              message.sender === "bot" 
                ? "bg-white rounded-lg p-3 ml-0 mr-auto" 
                : "bg-[#DCF8C6] rounded-lg p-3 ml-auto mr-0"
            }`}
          >
            <div className="text-sm">
              {message.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i !== message.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 bg-[#F0F2F5] border-t border-gray-200 flex items-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        <Button 
          variant="ghost"
          size="icon"
          onClick={handleAttachPhoto}
          className="text-[#128C7E]"
        >
          <Camera />
        </Button>
        <Input
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Digite uma mensagem"
          className="flex-1 mx-2 bg-white"
          onKeyDown={handleKeyPress}
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="bg-[#128C7E] hover:bg-[#0e6a61]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Chatbot;

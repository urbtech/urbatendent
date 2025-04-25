
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { AttachmentType, Message } from '@/types/ChatTypes';
import { useChatbot } from '@/hooks/useChatbot';

const Chatbot = () => {
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  
  const {
    messages,
    currentMessage,
    setCurrentMessage,
    orderData,
    setOrderData,
    processUserResponse,
    currentStep,
    setMessages,
    setCurrentStep
  } = useChatbot();

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
              text: "Obrigado pela foto! Digite 'confirmar' para finalizar seu pedido ou envie mais fotos.",
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
    
    if (e.target) {
      e.target.value = "";
    }
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
          onClick={() => navigate("/orders")}
        >
          Ver Pedidos
        </Button>
      </div>
      
      <MessageList messages={messages} />
      
      <ChatInput
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        onSendMessage={handleSendMessage}
        onFileChange={handleFileChange}
      />
    </div>
  );
};

export default Chatbot;

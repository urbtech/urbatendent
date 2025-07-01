
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import WhatsAppSetup from "@/components/whatsapp/WhatsAppSetup";

const WhatsAppConfig = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6 gap-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Configuração WhatsApp</h1>
      </div>
      
      <WhatsAppSetup />
    </div>
  );
};

export default WhatsAppConfig;

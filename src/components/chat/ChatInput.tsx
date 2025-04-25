
import React, { useRef, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Camera } from "lucide-react";
import { AttachmentType } from '@/types/ChatTypes';

interface ChatInputProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  onSendMessage: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInput = ({
  currentMessage,
  setCurrentMessage,
  onSendMessage,
  onFileChange
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSendMessage();
    }
  };

  const handleAttachPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-3 bg-[#F0F2F5] border-t border-gray-200 flex items-center">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onFileChange}
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
        onClick={onSendMessage}
        size="icon"
        className="bg-[#128C7E] hover:bg-[#0e6a61]"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

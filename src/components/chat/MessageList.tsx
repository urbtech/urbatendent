
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/ChatTypes';

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
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
  );
};

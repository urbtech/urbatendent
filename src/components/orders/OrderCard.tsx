
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

type OrderStatus = "novo" | "em andamento" | "concluído";

interface Order {
  id: string;
  customer_name: string;
  type: "empresarial" | "residencial" | null;
  waste_type: string | null;
  location: string | null;
  volume: string | null;
  photos: string[];
  status: OrderStatus;
  created_at: string;
}

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onClick: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const OrderCard: React.FC<OrderCardProps> = ({ order, isSelected, onClick }) => {
  return (
    <Card 
      className={`cursor-pointer ${isSelected ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="py-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{order.customer_name}</CardTitle>
          <Badge>{order.type}</Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(order.created_at)}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default OrderCard;


import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Trash } from "lucide-react";

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

interface OrderDetailsProps {
  order: Order | null;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
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

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onStatusUpdate, onDelete }) => {
  if (!order) {
    return (
      <Card className="h-full flex items-center justify-center p-10">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Nenhum pedido selecionado</h3>
          <p className="text-gray-500">Selecione um pedido na lista à esquerda para ver os detalhes.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
              <User size={20} />
            </div>
            <div>
              <CardTitle>{order.customer_name}</CardTitle>
              <CardDescription>
                {formatDate(order.created_at)}
              </CardDescription>
            </div>
          </div>
          <Badge 
            className={
              order.type === "empresarial" 
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-green-500 hover:bg-green-600"
            }
          >
            {order.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Tipo de Resíduo</h3>
            <p>{order.waste_type}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Volume</h3>
            <p>{order.volume}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Localização</h3>
          <p>{order.location}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Fotos ({order.photos.length})</h3>
          {order.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {order.photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma foto anexada</p>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Status</h3>
          <RadioGroup 
            defaultValue={order.status}
            onValueChange={(value) => onStatusUpdate(order.id, value as OrderStatus)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="novo" id="novo" />
              <Label htmlFor="novo">Novo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="em andamento" id="em-andamento" />
              <Label htmlFor="em-andamento">Em andamento</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="concluído" id="concluido" />
              <Label htmlFor="concluido">Concluído</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          variant="destructive"
          onClick={() => onDelete(order.id)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Remover pedido
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderDetails;

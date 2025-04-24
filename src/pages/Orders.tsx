
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Calendar, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

type OrderStatus = "novo" | "em andamento" | "concluído";

interface Order {
  id: string;
  customerName: string;
  type: "empresarial" | "residencial" | null;
  wasteType: string | null;
  location: string | null;
  volume: string | null;
  photos: string[];
  status: OrderStatus;
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentTab, setCurrentTab] = useState<OrderStatus>("novo");
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar pedidos do localStorage
    const storedOrders = JSON.parse(localStorage.getItem("urbtech_orders") || "[]");
    setOrders(storedOrders);
    filterOrders(storedOrders, currentTab);
  }, [currentTab]);

  const filterOrders = (allOrders: Order[], status: OrderStatus) => {
    const filtered = allOrders.filter(order => order.status === status);
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem("urbtech_orders", JSON.stringify(updatedOrders));
    filterOrders(updatedOrders, currentTab);

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    
    toast({
      title: "Status atualizado",
      description: `O pedido foi movido para '${newStatus}'`,
    });
  };

  const deleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem("urbtech_orders", JSON.stringify(updatedOrders));
    filterOrders(updatedOrders, currentTab);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
    
    toast({
      title: "Pedido removido",
      description: "O pedido foi removido permanentemente",
    });
  };

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6 gap-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o chat
        </Button>
        <h1 className="text-3xl font-bold">Fluxo de Pedidos</h1>
      </div>
      
      {orders.length === 0 ? (
        <Alert className="mb-6">
          <AlertDescription>
            Nenhum pedido foi registrado ainda. Os pedidos feitos no chatbot aparecerão aqui.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Tabs defaultValue="novo" className="w-full" onValueChange={(value) => setCurrentTab(value as OrderStatus)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="novo">Novos</TabsTrigger>
                <TabsTrigger value="em andamento">Em Andamento</TabsTrigger>
                <TabsTrigger value="concluído">Concluídos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="novo" className="space-y-4 mt-4">
                {filteredOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum pedido novo</p>
                ) : (
                  filteredOrders.map(order => (
                    <Card 
                      key={order.id} 
                      className={`cursor-pointer ${selectedOrder?.id === order.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{order.customerName}</CardTitle>
                          <Badge>{order.type}</Badge>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="em andamento" className="space-y-4 mt-4">
                {filteredOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum pedido em andamento</p>
                ) : (
                  filteredOrders.map(order => (
                    <Card 
                      key={order.id} 
                      className={`cursor-pointer ${selectedOrder?.id === order.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{order.customerName}</CardTitle>
                          <Badge>{order.type}</Badge>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="concluído" className="space-y-4 mt-4">
                {filteredOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum pedido concluído</p>
                ) : (
                  filteredOrders.map(order => (
                    <Card 
                      key={order.id} 
                      className={`cursor-pointer ${selectedOrder?.id === order.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{order.customerName}</CardTitle>
                          <Badge>{order.type}</Badge>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-2">
            {selectedOrder ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <User size={20} />
                      </div>
                      <div>
                        <CardTitle>{selectedOrder.customerName}</CardTitle>
                        <CardDescription>
                          {formatDate(selectedOrder.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className={
                        selectedOrder.type === "empresarial" 
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-green-500 hover:bg-green-600"
                      }
                    >
                      {selectedOrder.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Tipo de Resíduo</h3>
                      <p>{selectedOrder.wasteType}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Volume</h3>
                      <p>{selectedOrder.volume}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Localização</h3>
                    <p>{selectedOrder.location}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Fotos ({selectedOrder.photos.length})</h3>
                    {selectedOrder.photos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {selectedOrder.photos.map((photo, index) => (
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
                      defaultValue={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as OrderStatus)}
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
                    onClick={() => deleteOrder(selectedOrder.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Remover pedido
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center p-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Nenhum pedido selecionado</h3>
                  <p className="text-gray-500">Selecione um pedido na lista à esquerda para ver os detalhes.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

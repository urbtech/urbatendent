
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrders } from "@/hooks/useOrders";
import OrderTabs from "@/components/orders/OrderTabs";
import OrderDetails from "@/components/orders/OrderDetails";

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

const Orders = () => {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentTab, setCurrentTab] = useState<OrderStatus>("novo");
  const navigate = useNavigate();
  
  const { orders, loading, updateOrderStatus, deleteOrder } = useOrders();

  useEffect(() => {
    filterOrders(orders, currentTab);
  }, [orders, currentTab]);

  const filterOrders = (allOrders: Order[], status: OrderStatus) => {
    const filtered = allOrders.filter(order => order.status === status);
    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    const updatedOrder = await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId && updatedOrder) {
      setSelectedOrder(updatedOrder);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    await deleteOrder(orderId);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const handleTabChange = (value: OrderStatus) => {
    setCurrentTab(value);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center">
        <p>Carregando pedidos...</p>
      </div>
    );
  }

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
            <OrderTabs
              filteredOrders={filteredOrders}
              selectedOrder={selectedOrder}
              onOrderSelect={handleOrderSelect}
              onTabChange={handleTabChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <OrderDetails
              order={selectedOrder}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteOrder}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

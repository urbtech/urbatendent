
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderCard from './OrderCard';

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

interface OrderTabsProps {
  filteredOrders: Order[];
  selectedOrder: Order | null;
  onOrderSelect: (order: Order) => void;
  onTabChange: (value: OrderStatus) => void;
}

const OrderTabs: React.FC<OrderTabsProps> = ({ 
  filteredOrders, 
  selectedOrder, 
  onOrderSelect, 
  onTabChange 
}) => {
  const renderOrderList = (orders: Order[], emptyMessage: string) => {
    if (orders.length === 0) {
      return <p className="text-center text-gray-500 py-8">{emptyMessage}</p>;
    }

    return orders.map(order => (
      <OrderCard
        key={order.id}
        order={order}
        isSelected={selectedOrder?.id === order.id}
        onClick={() => onOrderSelect(order)}
      />
    ));
  };

  return (
    <Tabs defaultValue="novo" className="w-full" onValueChange={(value) => onTabChange(value as OrderStatus)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="novo">Novos</TabsTrigger>
        <TabsTrigger value="em andamento">Em Andamento</TabsTrigger>
        <TabsTrigger value="concluído">Concluídos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="novo" className="space-y-4 mt-4">
        {renderOrderList(filteredOrders, "Nenhum pedido novo")}
      </TabsContent>
      
      <TabsContent value="em andamento" className="space-y-4 mt-4">
        {renderOrderList(filteredOrders, "Nenhum pedido em andamento")}
      </TabsContent>
      
      <TabsContent value="concluído" className="space-y-4 mt-4">
        {renderOrderList(filteredOrders, "Nenhum pedido concluído")}
      </TabsContent>
    </Tabs>
  );
};

export default OrderTabs;

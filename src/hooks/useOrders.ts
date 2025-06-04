
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";

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

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const apiOrders = await apiService.orders.getAll();
      setOrders(apiOrders);
    } catch (error) {
      console.warn('API falhou, carregando do localStorage:', error);
      const localOrders = JSON.parse(localStorage.getItem("urbtech_orders") || "[]");
      const formattedOrders = localOrders.map((order: any) => ({
        ...order,
        customer_name: order.customerName,
        waste_type: order.wasteType,
        created_at: order.createdAt
      }));
      setOrders(formattedOrders);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiService.orders.updateStatus(orderId, newStatus);
      
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      toast({
        title: "Status atualizado",
        description: `O pedido foi movido para '${newStatus}'`,
      });

      return updatedOrders.find(order => order.id === orderId);
    } catch (error) {
      console.warn('API falhou, atualizando localStorage:', error);
      
      const localOrders = JSON.parse(localStorage.getItem("urbtech_orders") || "[]");
      const updatedLocalOrders = localOrders.map((order: any) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      
      localStorage.setItem("urbtech_orders", JSON.stringify(updatedLocalOrders));
      loadOrders();
      
      toast({
        title: "Status atualizado",
        description: `O pedido foi movido para '${newStatus}'`,
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await apiService.orders.delete(orderId);
      
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      
      toast({
        title: "Pedido removido",
        description: "O pedido foi removido permanentemente",
      });
    } catch (error) {
      console.warn('API falhou, removendo do localStorage:', error);
      
      const localOrders = JSON.parse(localStorage.getItem("urbtech_orders") || "[]");
      const updatedLocalOrders = localOrders.filter((order: any) => order.id !== orderId);
      
      localStorage.setItem("urbtech_orders", JSON.stringify(updatedLocalOrders));
      loadOrders();
      
      toast({
        title: "Pedido removido",
        description: "O pedido foi removido permanentemente",
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    updateOrderStatus,
    deleteOrder,
    loadOrders
  };
};

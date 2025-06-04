
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const apiService = {
  customers: {
    create: async (name: string, type: string, location: string) => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, location }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar cliente');
      }

      return response.json();
    },

    getAll: async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/customers`);

      if (!response.ok) {
        throw new Error('Falha ao buscar clientes');
      }

      return response.json();
    },
  },

  orders: {
    create: async (orderData: any) => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar pedido');
      }

      return response.json();
    },

    getAll: async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`);

      if (!response.ok) {
        throw new Error('Falha ao buscar pedidos');
      }

      return response.json();
    },

    updateStatus: async (id: string, status: string) => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status');
      }

      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/orders`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar pedido');
      }

      return response.json();
    },
  },
};


import { Customer, CustomerType } from "../types/Customer";

const STORAGE_KEY = "urbtech_customers";

export const customerService = {
  create: (name: string, type: CustomerType, location: string): Customer => {
    const customers = getAllCustomers();
    
    // Verificar se o cliente já existe
    const existingCustomer = customers.find(
      c => c.name.toLowerCase() === name.toLowerCase() && 
           c.location.toLowerCase() === location.toLowerCase()
    );
    
    if (existingCustomer) {
      // Atualizar dados se necessário
      existingCustomer.type = type;
      existingCustomer.updatedAt = new Date().toISOString();
      saveCustomers(customers);
      return existingCustomer;
    }

    // Criar novo cliente
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name,
      type,
      location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customers.unshift(newCustomer);
    saveCustomers(customers);
    return newCustomer;
  },

  getAll: (): Customer[] => {
    return getAllCustomers();
  }
};

// Funções auxiliares
const getAllCustomers = (): Customer[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveCustomers = (customers: Customer[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

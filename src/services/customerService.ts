
import { Customer, CustomerType } from "../types/Customer";
import { apiService } from "./apiService";

export const customerService = {
  create: async (name: string, type: CustomerType, location: string): Promise<Customer> => {
    try {
      const customer = await apiService.customers.create(name, type, location);
      return {
        id: customer.id,
        name: customer.name,
        type: customer.type,
        location: customer.location,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      };
    } catch (error) {
      // Fallback para localStorage se a API falhar
      console.warn('API falhou, usando localStorage:', error);
      return createLocalCustomer(name, type, location);
    }
  },

  getAll: async (): Promise<Customer[]> => {
    try {
      const customers = await apiService.customers.getAll();
      return customers.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        type: customer.type,
        location: customer.location,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      }));
    } catch (error) {
      // Fallback para localStorage se a API falhar
      console.warn('API falhou, usando localStorage:', error);
      return getAllLocalCustomers();
    }
  }
};

// Funções de fallback para localStorage
const createLocalCustomer = (name: string, type: CustomerType, location: string): Customer => {
  const customers = getAllLocalCustomers();
  
  const existingCustomer = customers.find(
    c => c.name.toLowerCase() === name.toLowerCase() && 
         c.location.toLowerCase() === location.toLowerCase()
  );
  
  if (existingCustomer) {
    existingCustomer.type = type;
    existingCustomer.updatedAt = new Date().toISOString();
    saveLocalCustomers(customers);
    return existingCustomer;
  }

  const newCustomer: Customer = {
    id: Date.now().toString(),
    name,
    type,
    location,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  customers.unshift(newCustomer);
  saveLocalCustomers(customers);
  return newCustomer;
};

const getAllLocalCustomers = (): Customer[] => {
  const data = localStorage.getItem("urbtech_customers");
  return data ? JSON.parse(data) : [];
};

const saveLocalCustomers = (customers: Customer[]) => {
  localStorage.setItem("urbtech_customers", JSON.stringify(customers));
};

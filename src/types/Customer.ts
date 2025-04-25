
export type CustomerType = "empresarial" | "residencial";

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  location: string;
  createdAt: string;
  updatedAt: string;
}

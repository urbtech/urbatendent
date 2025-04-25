
export type Message = {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
};

export type AttachmentType = {
  type: "image";
  url: string;
};

export type OrderData = {
  customerName: string;
  type: "empresarial" | "residencial" | null;
  wasteType: string | null;
  location: string | null;
  volume: string | null;
  photos: string[];
  status: "novo" | "em andamento" | "concluído";
  createdAt: Date;
};

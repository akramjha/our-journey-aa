export interface TunangItem {
  id?: string;

  category: string;

  name: string;

  price: number;

  quantity?: number;

  vendor?: string;

  details?: string;

  progress: string;

  createdAt?: number;
  completed?: boolean;
  dueDate?: string;
}
export interface TunangFile {
  url: string;
  name: string;
  type: string;
}

export interface TunangItem {
  id?: string;
  category: string;
  name: string;
  price: number;
  quantity?: number;
  vendor?: string;
  details?: string;
  progress: string;
  priority?: string;
  wishlistLink?: string;
  files?: TunangFile[];
  createdAt?: number;
  completed?: boolean;
  dueDate?: string;
}
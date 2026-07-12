export interface WeddingFile {
  url: string;
  name: string;
  type: string;
}

export interface WeddingEventItem {
  id?: string;
  category: string;
  name: string;
  quantity?: number;
  price: number;
  vendor?: string;
  details?: string;
  progress: string;
  priority?: string;
  wishlistLink?: string;
  files?: WeddingFile[];
  createdAt?: number;
  completed?: boolean;
  dueDate?: string;
}
export interface WeddingSavings {
  id?: string;
  target: number;
  saved: number;
}

export interface WeddingTask {
  id?: string;
  title: string;
  phase: "foundation" | "planning" | "preparation" | "final";
  completed: boolean;
}

export interface WeddingShopping {
  id?: string;
  item: string;
  price: number;
  category: string;
  bought: boolean;
}

export interface WeddingSavings {
  id?: string;
  target: number;
  saved: number;
}
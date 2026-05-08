export interface NikahFile {
  url: string;
  name: string;
  type: string;
}

export interface NikahItem {
  id?: string;

  category: string;

  name: string;
  price: number;
  vendor?: string;
  details?: string;
  progress: string;

  priority?: string;
  wishlistLink?: string;

  files?: NikahFile[];

  createdAt?: number;
}
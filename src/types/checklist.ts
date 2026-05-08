export interface ChecklistItem {
  id?: string;

  category: string;
  item: string;
  progress: string;

  notes?: string;

  fileUrl?: string;
  fileName?: string;

  createdAt?: number;
}
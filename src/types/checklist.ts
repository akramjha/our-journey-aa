export interface ChecklistFile {
  url: string;
  name: string;
  type: string;
}

export interface ChecklistItem {
  id?: string;

  category: string;

  item: string;

  progress: string;

  notes?: string;

  files?: ChecklistFile[];

  createdAt?: number;

  completed?: boolean;

  dueDate?: string;
}
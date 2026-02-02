export type ItemStatus = 'Open' | 'In Progress' | 'Done';

export interface Item {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt?: string;
}

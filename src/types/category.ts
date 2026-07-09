export type CategoryStatus = 'active' | 'archived';

export type Category = {
  id: string;
  name: string;
  colorToken?: string;
  iconName?: string;
  sortOrder: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
};

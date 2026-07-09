export type SupplierStatus = 'active' | 'archived';

export type Supplier = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
  notes?: string;
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
};

export interface Job {
  id: string;
  title: string;
  customer: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'unpaid';
  dueDate: string;
}

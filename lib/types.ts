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
  email: string;
  phone?: string;
  role: string;
}

export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status?: string;
  date?: string;
  items?: { name: string; price: number }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';
export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue';
export type UserRole = 'admin' | 'dispatcher' | 'technician';
export type InviteStatus = 'pending' | 'accepted' | 'revoked';

export interface Organization {
  id: string;
  name: string;
  createdAt?: string;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Invite {
  id: string;
  orgId: string;
  email: string;
  role: UserRole;
  token: string;
  status: InviteStatus;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string | null;
  status: JobStatus;
  priority: JobPriority;
  date: string;
  customerId?: string | null;
  customer: string;
  technicianId?: string | null;
  technician?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface JobEvent {
  id: string;
  jobId: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  body: string;
  editedAt?: string | null;
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  lat?: number | null;
  lng?: number | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface InvoiceItem {
  name: string;
  price: number;
}

export interface Invoice {
  id: string;
  customerId?: string | null;
  customer: string;
  amount: number;
  status: InvoiceStatus;
  date?: string | null;
  items?: InvoiceItem[];
}

export interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  cancelledJobs: number;
  totalCustomers: number;
  totalTechnicians: number;
  paidRevenue: number;
  outstandingRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  jobsByStatus: { name: string; value: number }[];
  jobsPerTechnician: { name: string; jobs: number }[];
}

import { Job, Technician, Customer, Invoice } from './types';

export const jobs: Job[] = [
  {
    id: 'j1',
    title: 'Air Conditioner Repair',
    customer: 'Ibrahim Musa',
    description: 'Fixing AC cooling issue.',
    status: 'pending',
    date: '2025-07-14',
  },
  {
    id: 'j2',
    title: 'Electrical Installation',
    customer: 'Fatima Bello',
    status: 'completed',
    date: '2025-07-13',
  },
  {
    id: 'j3',
    title: 'Plumbing Maintenance',
    customer: 'Chinedu Okafor',
    status: 'cancelled',
    date: '2025-07-10',
  },
];

export const technicians: Technician[] = [
  { id: 't1', name: 'Aliyu Danjuma', role: 'Electrician', phone: '08012345678' },
  { id: 't2', name: 'Chioma Uche', role: 'Plumber', phone: '08087654321' },
];

export const customers: Customer[] = [
  { id: 'c1', name: 'Ibrahim Musa', email: 'ibrahim@example.com', phone: '08012312345', address: 'houston, california' },
  { id: 'c2', name: 'Fatima Bello', email: 'fatima@example.com', phone: '08045678901', address: 'houston, california' },
];

export const invoices: Invoice[] = [
  { id: 'inv1', customer: 'Ibrahim Musa', amount: 15000, status: 'unpaid', dueDate: '2025-07-20' },
  { id: 'inv2', customer: 'Fatima Bello', amount: 30000, status: 'paid', dueDate: '2025-07-10' },
];

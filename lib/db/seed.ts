import { db } from './index';
import { runMigrations } from './migrate';
import {
  customers,
  invoices,
  invoiceItems,
  jobEvents,
  jobs,
  technicians,
  users,
} from './schema';
import { hashPassword } from '../auth/password';

// Demo data. All of it is made up.
const customerRows = [
  { id: 'cus_ibrahim', name: 'Ibrahim Musa', email: 'ibrahim@example.com', phone: '08012312345', address: '12 Adeola Odeku, Victoria Island', lat: 6.4281, lng: 3.4219 },
  { id: 'cus_fatima', name: 'Fatima Bello', email: 'fatima@example.com', phone: '08045678901', address: '8 Herbert Macaulay, Yaba', lat: 6.5095, lng: 3.3711 },
  { id: 'cus_chinedu', name: 'Chinedu Okafor', email: 'chinedu@example.com', phone: '08099887766', address: '45 Allen Avenue, Ikeja', lat: 6.6018, lng: 3.3515 },
  { id: 'cus_grace', name: 'Grace Adeyemi', email: 'grace@example.com', phone: '08055443322', address: '3 Admiralty Way, Lekki Phase 1', lat: 6.4413, lng: 3.4597 },
];

const technicianRows = [
  { id: 'tech_aliyu', name: 'Aliyu Danjuma', email: 'aliyu@quickset.com', phone: '08012345678', role: 'Electrician', lat: 6.5149, lng: 3.3676 },
  { id: 'tech_chioma', name: 'Chioma Uche', email: 'chioma@quickset.com', phone: '08087654321', role: 'Plumber', lat: 6.5379, lng: 3.3915 },
  { id: 'tech_tunde', name: 'Tunde Bakare', email: 'tunde@quickset.com', phone: '08011223344', role: 'HVAC Technician', lat: 6.4654, lng: 3.4064 },
];

const jobRows = [
  { id: 'job_ac_repair', title: 'Air Conditioner Repair', description: 'Fixing AC cooling issue.', status: 'pending', priority: 'high', date: '2025-07-14', customerId: 'cus_ibrahim', technicianId: 'tech_tunde', lat: 6.5244, lng: 3.3792 },
  { id: 'job_electrical', title: 'Electrical Installation', description: 'New wiring for the store front.', status: 'completed', priority: 'normal', date: '2025-07-13', customerId: 'cus_fatima', technicianId: 'tech_aliyu', lat: 6.4654, lng: 3.4064 },
  { id: 'job_plumbing', title: 'Plumbing Maintenance', description: 'Leaking kitchen pipe.', status: 'cancelled', priority: 'low', date: '2025-07-10', customerId: 'cus_chinedu', technicianId: 'tech_chioma', lat: 6.6018, lng: 3.3515 },
  { id: 'job_ac_install', title: 'AC Installation', description: 'Install two split units.', status: 'completed', priority: 'normal', date: '2025-06-22', customerId: 'cus_grace', technicianId: 'tech_tunde', lat: 6.4413, lng: 3.4597 },
  { id: 'job_generator', title: 'Generator Servicing', description: 'Routine 100-hour service.', status: 'in_progress', priority: 'urgent', date: '2025-06-18', customerId: 'cus_ibrahim', technicianId: 'tech_aliyu', lat: 6.4281, lng: 3.4219 },
  { id: 'job_sink', title: 'Kitchen Sink Replacement', description: 'Replace cracked basin.', status: 'completed', priority: 'normal', date: '2025-05-30', customerId: 'cus_fatima', technicianId: 'tech_chioma', lat: 6.5095, lng: 3.3711 },
  { id: 'job_wiring', title: 'Faulty Socket Repair', description: 'Bedroom sockets sparking.', status: 'pending', priority: 'high', date: '2025-05-21', customerId: 'cus_grace', technicianId: 'tech_aliyu', lat: 6.4413, lng: 3.4597 },
];

const invoiceRows = [
  { id: 'inv_001', customerId: 'cus_ibrahim', amount: 15000, status: 'unpaid', date: '2025-07-20', items: [{ name: 'Diagnostics', price: 5000 }, { name: 'Refrigerant top-up', price: 10000 }] },
  { id: 'inv_002', customerId: 'cus_fatima', amount: 30000, status: 'paid', date: '2025-07-10', items: [{ name: 'Wiring & conduits', price: 22000 }, { name: 'Labour', price: 8000 }] },
  { id: 'inv_003', customerId: 'cus_grace', amount: 85000, status: 'paid', date: '2025-06-25', items: [{ name: 'Split AC unit x2', price: 70000 }, { name: 'Installation', price: 15000 }] },
  { id: 'inv_004', customerId: 'cus_chinedu', amount: 12000, status: 'overdue', date: '2025-06-12', items: [{ name: 'Pipe replacement', price: 12000 }] },
  { id: 'inv_005', customerId: 'cus_fatima', amount: 22000, status: 'paid', date: '2025-05-30', items: [{ name: 'Sink + tap set', price: 17000 }, { name: 'Labour', price: 5000 }] },
];

async function seed() {
  await runMigrations();

  await db.delete(jobEvents);
  await db.delete(invoiceItems);
  await db.delete(invoices);
  await db.delete(jobs);
  await db.delete(technicians);
  await db.delete(customers);
  await db.delete(users);

  await db.insert(customers).values(customerRows);
  await db.insert(technicians).values(technicianRows);
  await db.insert(jobs).values(jobRows);

  for (const invoice of invoiceRows) {
    await db.insert(invoices).values({
      id: invoice.id,
      customerId: invoice.customerId,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
    });

    await db.insert(invoiceItems).values(
      invoice.items.map((item) => ({
        id: `${invoice.id}_${item.name.replace(/\s+/g, '_').toLowerCase()}`,
        invoiceId: invoice.id,
        name: item.name,
        price: item.price,
      })),
    );
  }

  // activity trail for a couple of jobs so the detail page has some history
  await db.insert(jobEvents).values([
    { id: 'evt_seed_1', jobId: 'job_ac_repair', type: 'created', message: 'Job created' },
    { id: 'evt_seed_2', jobId: 'job_ac_repair', type: 'assignment', message: 'Assigned to Tunde Bakare' },
    { id: 'evt_seed_3', jobId: 'job_generator', type: 'status', message: 'Status changed from pending to in progress' },
  ]);

  // the demo login shown on the README / login page.
  await db.insert(users).values({
    id: 'usr_demo',
    name: 'Demo Dispatcher',
    email: 'demo@quickset.com',
    passwordHash: hashPassword('demo123'),
    role: 'admin',
  });

  const counts = {
    users: customerRows.length && (await db.select().from(users)).length,
    customers: customerRows.length,
    technicians: technicianRows.length,
    jobs: jobRows.length,
    invoices: invoiceRows.length,
  };

  console.log('Seed complete:', counts);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

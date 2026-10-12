import { listCustomers, listJobs, listTechnicians } from '@/lib/db/queries';
import { PageHeader } from '@/components/layout/PageHeader';
import MapView from '@/components/MapView';
import type { MarkerData } from '@/components/Map';

export default async function MapPage() {
  const [jobs, technicians, customers] = await Promise.all([
    listJobs(),
    listTechnicians(),
    listCustomers(),
  ]);

  const hasCoords = (row: { lat?: number | null; lng?: number | null }) =>
    row.lat != null && row.lng != null;

  const markers: MarkerData[] = [
    ...jobs
      .filter(hasCoords)
      .map((job) => ({
        id: job.id,
        lat: job.lat as number,
        lng: job.lng as number,
        label: `${job.title} - ${job.customer}`,
        type: 'job' as const,
      })),
    ...technicians
      .filter(hasCoords)
      .map((tech) => ({
        id: tech.id,
        lat: tech.lat as number,
        lng: tech.lng as number,
        label: `${tech.name} (${tech.role})`,
        type: 'technician' as const,
      })),
    ...customers
      .filter(hasCoords)
      .map((customer) => ({
        id: customer.id,
        lat: customer.lat as number,
        lng: customer.lng as number,
        label: customer.name,
        type: 'customer' as const,
      })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Service map"
        description="Where your jobs, technicians and customers are based."
      />
      <MapView markers={markers} />
    </div>
  );
}

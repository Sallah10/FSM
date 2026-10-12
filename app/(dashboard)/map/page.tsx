import MapView from '@/components/MapView';
import { listCustomers, listJobs, listTechnicians } from '@/lib/db/queries';
import type { MarkerData } from '@/components/Map';

export default function MapPage() {
  const hasCoords = (row: { lat?: number | null; lng?: number | null }) =>
    row.lat != null && row.lng != null;

  const markers: MarkerData[] = [
    ...listJobs()
      .filter(hasCoords)
      .map((job) => ({
        id: job.id,
        lat: job.lat as number,
        lng: job.lng as number,
        label: `🔧 ${job.title} - ${job.customer}`,
        type: 'job' as const,
      })),
    ...listTechnicians()
      .filter(hasCoords)
      .map((tech) => ({
        id: tech.id,
        lat: tech.lat as number,
        lng: tech.lng as number,
        label: `👨‍🔧 ${tech.name} (${tech.role})`,
        type: 'technician' as const,
      })),
    ...listCustomers()
      .filter(hasCoords)
      .map((customer) => ({
        id: customer.id,
        lat: customer.lat as number,
        lng: customer.lng as number,
        label: `👤 ${customer.name}`,
        type: 'customer' as const,
      })),
  ];

  return <MapView markers={markers} />;
}

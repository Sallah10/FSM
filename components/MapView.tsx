'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { MarkerData } from '@/components/Map';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-md bg-gray-100 flex items-center justify-center">
      <Skeleton className="h-full w-full animate-pulse" />
    </div>
  ),
});

export default function MapView({ markers }: { markers: MarkerData[] }) {
  const [showJobs, setShowJobs] = useState(true);
  const [showTechs, setShowTechs] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<null | { lat: number; lng: number }>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          setLocationError(
            error.code === error.PERMISSION_DENIED
              ? 'Location access was denied'
              : 'Failed to get location'
          );
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation is not supported');
    }
  }, []);

  const filterBySearch = (arr: MarkerData[]) =>
    arr.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));

  const visible: MarkerData[] = [
    ...(showJobs ? filterBySearch(markers.filter((m) => m.type === 'job')) : []),
    ...(showTechs ? filterBySearch(markers.filter((m) => m.type === 'technician')) : []),
    ...(showCustomers ? filterBySearch(markers.filter((m) => m.type === 'customer')) : []),
    ...(userLocation
      ? [
        {
          id: 'user',
          lat: userLocation.lat,
          lng: userLocation.lng,
          label: '📍 You Are Here',
          type: 'user' as const,
        },
      ]
      : []),
  ];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Service Map Overview</h1>
      <p className="text-muted-foreground text-sm">
        View active technicians, job sites, customers and your location.
      </p>

      {locationError && (
        <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
          {locationError} - Showing map without your location
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={showJobs ? 'default' : 'outline'}
          onClick={() => setShowJobs(!showJobs)}
        >
          Jobs
        </Button>
        <Button
          variant={showTechs ? 'default' : 'outline'}
          onClick={() => setShowTechs(!showTechs)}
        >
          Technicians
        </Button>
        <Button
          variant={showCustomers ? 'default' : 'outline'}
          onClick={() => setShowCustomers(!showCustomers)}
        >
          Customers
        </Button>
      </div>

      <input
        type="text"
        placeholder="Search jobs or technicians..."
        className="w-full max-w-sm border border-border p-2 rounded-md text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Map
        markers={visible}
        fallback={
          <div className="h-[500px] w-full bg-gray-100 rounded-md flex items-center justify-center">
            Initializing map...
          </div>
        }
      />
    </main>
  );
}

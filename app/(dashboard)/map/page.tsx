'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { MarkerData } from "@/components/Map";


const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-md bg-gray-100 flex items-center justify-center">
      <Skeleton className="h-full w-full animate-pulse" />
    </div>
  ),
});


const jobs = [
  {
    id: "job-1",
    lat: 6.5244,
    lng: 3.3792,
    label: "🔧 AC Installation - Mr. A",
    type: "job" as const
  },
  {
    id: "job-2",
    lat: 6.4654,
    lng: 3.4064,
    label: "🔧 Washing Machine Repair - Mrs. B",
    type: "job" as const
  }
];

const technicians = [
  {
    id: "tech-1",
    lat: 6.5149,
    lng: 3.3676,
    label: "👨‍🔧 Tech Musa",
    type: "technician" as const
  },
  {
    id: "tech-2",
    lat: 6.5379,
    lng: 3.3915,
    label: "👨‍🔧 Tech Bola",
    type: "technician" as const
  }
];

const customers = [
  {
    id: "cust-1",
    lat: 6.5182,
    lng: 3.3769,
    label: "👤 Customer John",
    type: "customer" as const
  }
];

export default function FullMapPage() {
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

  const filterBySearch = <T extends MarkerData>(arr: T[]): T[] =>
    arr.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );

  const markers: MarkerData[] = [
    ...(showJobs ? filterBySearch(jobs) : []),
    ...(showTechs ? filterBySearch(technicians) : []),
    ...(showCustomers ? filterBySearch(customers) : []),
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
        markers={markers}
        fallback={
          <div className="h-[500px] w-full bg-gray-100 rounded-md flex items-center justify-center">
            Initializing map...
          </div>
        }
      />
    </main>
  );
}
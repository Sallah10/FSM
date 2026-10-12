'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { MarkerData } from '@/components/Map';

type MapComponent = React.ComponentType<{
  markers: MarkerData[];
  fallback?: React.ReactNode;
}>;

const LAYERS: { type: MarkerData['type']; label: string; dot: string }[] = [
  { type: 'job', label: 'Jobs', dot: 'bg-emerald-500' },
  { type: 'technician', label: 'Technicians', dot: 'bg-blue-500' },
  { type: 'customer', label: 'Customers', dot: 'bg-red-500' },
];

export default function MapView({ markers }: { markers: MarkerData[] }) {
  const [Map, setMap] = useState<MapComponent | null>(null);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    job: true,
    technician: true,
    customer: true,
  });
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<null | { lat: number; lng: number }>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    import('@/components/Map').then((mod) => {
      if (active) setMap(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocationError('Location unavailable - showing the map without you.'),
        { timeout: 10000 },
      );
    }
  }, []);

  const query = search.trim().toLowerCase();
  const shown = markers.filter(
    (marker) => visible[marker.type] && (!query || marker.label.toLowerCase().includes(query)),
  );

  const displayed: MarkerData[] = userLocation
    ? [
      ...shown,
      { id: 'user', lat: userLocation.lat, lng: userLocation.lng, label: 'Your location', type: 'user' },
    ]
    : shown;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {LAYERS.map((layer) => (
            <button
              key={layer.type}
              type="button"
              onClick={() =>
                setVisible((prev) => ({ ...prev, [layer.type]: !prev[layer.type] }))
              }
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
                visible[layer.type]
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/60',
              )}
            >
              <span className={cn('size-2 rounded-full', visible[layer.type] ? layer.dot : 'bg-muted-foreground/40')} />
              {layer.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the map…"
            className="pl-8"
          />
        </div>
      </div>

      {locationError ? (
        <p className="text-xs text-muted-foreground">{locationError}</p>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        {Map ? (
          <Map markers={displayed} fallback={<Skeleton className="h-[520px] w-full" />} />
        ) : (
          <Skeleton className="h-[520px] w-full" />
        )}
      </div>
    </div>
  );
}

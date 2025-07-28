'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import L from 'leaflet';
import 'leaflet.markercluster'; // Essential plugin import
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'job' | 'technician' | 'customer' | 'user';
}

interface MapProps {
  markers: MarkerData[];
  fallback?: React.ReactNode;
}

const iconBase = '/markers';

const getMarkerIcon = (type: MarkerData['type']) => {
  const colorMap: Record<string, string> = {
    job: 'green',
    technician: 'blue',
    customer: 'red',
    user: 'orange',
  };

  const color = colorMap[type] || 'blue';

  // Fix for Leaflet icon paths
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: `${iconBase}/marker-icon-2x-${color}.png`,
      iconUrl: `${iconBase}/marker-icon-${color}.png`,
      shadowUrl: `${iconBase}/marker-shadow.png`,
    });
  }

  return new L.Icon({
    iconUrl: `${iconBase}/marker-icon-2x-${color}.png`,
    iconRetinaUrl: `${iconBase}/marker-icon-${color}.png`,
    shadowUrl: `${iconBase}/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function MarkerClusters({ markers }: { markers: MarkerData[] }) {
  const map = useMap();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!map || !markers.length) return;

    try {
      // Create cluster group using Leaflet's extended method
      const markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      });

      markers.forEach((marker) => {
        const leafletMarker = L.marker([marker.lat, marker.lng], {
          icon: getMarkerIcon(marker.type),
        }).bindPopup(marker.label);

        markerClusterGroup.addLayer(leafletMarker);
      });

      map.addLayer(markerClusterGroup);

      return () => {
        map.removeLayer(markerClusterGroup);
      };
    } catch (err) {
      setError('Failed to create clusters');
      console.error('Cluster error:', err);
    }
  }, [map, markers]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600">
        {error}
      </div>
    );
  }

  return null;
}

export default function Map({ markers, fallback }: MapProps) {
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  if (typeof window === 'undefined') {
    return fallback || (
      <div className="h-[500px] w-full bg-gray-100 rounded-md flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full rounded-md">
      <MapContainer
        center={[6.5244, 3.3792]}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full z-0"
        whenReady={() => setMapLoaded(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            error: () => setMapError('Failed to load map tiles'),
          }}
        />
        {mapLoaded && <MarkerClusters markers={markers} />}
      </MapContainer>

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          Loading map...
        </div>
      )}

      {mapError && (
        <div className="absolute bottom-4 left-4 bg-red-100 text-red-700 p-2 rounded-md text-sm">
          {mapError}
        </div>
      )}
    </div>
  );
}
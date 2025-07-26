// components/Map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MarkerData {
    id: string;
    lat: number;
    lng: number;
    label: string;
    type: 'job' | 'technician' | 'customer' | 'user';
}

interface MapProps {
    markers: MarkerData[];
}

// Load different marker icons from public folder
const iconBase = '/markers';

const getMarkerIcon = (type: MarkerData['type']) => {
    const colorMap: Record<string, string> = {
        job: 'green',
        technician: 'blue',
        customer: 'red',
        user: 'orange',
    };

    const color = colorMap[type] || 'blue';

    return new L.Icon({
        iconUrl: `${iconBase}/marker-icon-2x-${color}.png`,
        shadowUrl: `${iconBase}/marker-shadow.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

export default function Map({ markers }: MapProps) {
    return (
        <MapContainer
            center={[6.5244, 3.3792]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-[500px] w-full rounded-md z-0"
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MarkerClusterGroup>
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={[marker.lat, marker.lng]}
                        icon={getMarkerIcon(marker.type)}
                    >
                        <Popup>{marker.label}</Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}

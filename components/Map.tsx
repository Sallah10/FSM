'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';

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

// Cluster logic
function MarkerClusters({ markers }: { markers: MarkerData[] }) {
    const map = useMap();

    useEffect(() => {
        const markerClusterGroup = L.markerClusterGroup();

        const leafletMarkers = markers.map((marker) =>
            L.marker([marker.lat, marker.lng], { icon: getMarkerIcon(marker.type) }).bindPopup(
                marker.label
            )
        );

        leafletMarkers.forEach((m) => markerClusterGroup.addLayer(m));
        map.addLayer(markerClusterGroup);

        return () => {
            map.removeLayer(markerClusterGroup);
        };
    }, [markers, map]);

    return null;
}

export default function Map({ markers }: MapProps) {
    return (
        <MapContainer
            center={[6.5244, 3.3792]}
            zoom={12}
            scrollWheelZoom
            className="h-[500px] w-full rounded-md z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusters markers={markers} />
        </MapContainer>
    );
}

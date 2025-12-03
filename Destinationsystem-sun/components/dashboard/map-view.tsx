"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { cn } from "@lib/utils";
import { MapLocation } from '@/shared/types';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapProps {
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  setSelectedLocation: (loc: MapLocation | null) => void;
  className?: string;
}

function FlyToMarker({ location }: { location: MapLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(
        { lat: location.coordinates[0], lng: location.coordinates[1] },
        15,
        { animate: true }
      );
    }
  }, [location, map]);
  return null;
}

function MapInstance({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

export default function MapView({
  locations,
  selectedLocation,
  setSelectedLocation,
  className,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Clean up on unmount to prevent re-initialization errors
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (locations.length === 0) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-slate-50", className)}>
        <p className="text-slate-500">ไม่มีข้อมูลตำแหน่งให้แสดง</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={{ lat: 13.7563, lng: 100.5018 }}
      zoom={10}
      className={cn("w-full h-full", className)}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInstance mapRef={mapRef} />
      <FlyToMarker location={selectedLocation} />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={{ lat: loc.coordinates[0], lng: loc.coordinates[1] }}
          icon={L.divIcon({
            html: `
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10.5 2 6 6.5 6 12c0 10 10 18 10 18s10-8 10-18c0-5.5-4.5-10-10-10z" 
                      fill="${loc.severity === 4 ? '#ef4444' : loc.severity === 3 ? '#f97316' : loc.severity === 2 ? '#fbbf24' : '#4ade80'}" 
                      stroke="#fff" stroke-width="2"/>
                <circle cx="16" cy="12" r="4" fill="#fff"/>
              </svg>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            className: "custom-marker",
          })}
          eventHandlers={{
            click: () => {
              setSelectedLocation(loc);
              document.getElementById(`case-${loc.id}`)?.scrollIntoView({ behavior: "smooth" });
            },
          }}
          opacity={selectedLocation?.id === loc.id ? 1 : 0.8}
          zIndexOffset={selectedLocation?.id === loc.id ? 1000 : 0}
        >
          <Popup>
            <div className="p-1 text-xs">
              <strong>{loc.title}</strong>
              <br />
              ผู้ป่วย: {loc.patientName}
              <br />
              สถานะ: <span className="font-medium">{loc.status}</span>
              <br />
              {loc.address}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
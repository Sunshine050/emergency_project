"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { MapLocation } from "@/shared/types";

// โหลด React-Leaflet แบบปิด SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export const MapView = ({
  mapLocations,
  onLocationSelect,
}: {
  mapLocations: MapLocation[];
  onLocationSelect: (loc: MapLocation | null) => void;
}) => {
  const { toast } = useToast();
  const [L, setLeaflet] = useState<any>(null);

  // ✅ โหลด leaflet เฉพาะฝั่ง client
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setLeaflet(leaflet);
    });
  }, []);

  if (!L) {
    return <div className="p-4 text-center text-gray-500">กำลังโหลดแผนที่...</div>;
  }

  const getMarkerIcon = (severity: number) => {
    const colors: Record<number, string> = {
      1: "#10b981",
      2: "#f59e0b",
      3: "#f97316",
      4: "#ef4444",
    };
    const color = colors[severity] || "#3b82f6";

    const html = `
      <div class="custom-marker" style="--marker-color: ${color};">
        <div class="pulse-ring"></div>
        <div class="inner-marker"></div>
        <div class="marker-tip"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-div-icon",
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      popupAnchor: [0, -40],
    });
  };

  return (
    <MapContainer
      center={[13.7563, 100.5018]}
      zoom={10}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {mapLocations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.coordinates}
          icon={getMarkerIcon(loc.severity)}
          eventHandlers={{ click: () => onLocationSelect(loc) }}
        >
          <Popup>
            <div className="space-y-1">
              <h3 className="font-bold text-sm">{loc.title}</h3>
              <p className="text-xs text-gray-600">{loc.address}</p>
              <p className="text-xs text-gray-600">ผู้ป่วย: {loc.patientName}</p>
              <p className="text-xs text-gray-600">สถานะ: {loc.status}</p>
              <p className="text-xs text-gray-600 mt-1">{loc.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

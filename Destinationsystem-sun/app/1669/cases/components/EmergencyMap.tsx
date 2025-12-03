// app/1669/cases/components/MapView.tsx
// Isolated map component (Leaflet + markers)
import { useEffect, useRef } from "react";
import { useMap, FeatureGroup } from "react-leaflet";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useToast } from "@/shared/hooks/use-toast";
import { MapLocation } from "@/shared/types";

const Marker = dynamic(() => import("react-leaflet").then((mod) => ({ default: mod.Marker })), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => ({ default: mod.Popup })), { ssr: false });

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

interface MapViewProps {
  mapLocations: MapLocation[];
  onLocationSelect: (loc: MapLocation | null) => void;
}

export const MapView: React.FC<MapViewProps> = ({ mapLocations, onLocationSelect }) => {
  const map = useMap();
  const mapRef = useRef<L.Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      mapRef.current = map;
      map.invalidateSize();

      if (mapLocations.length === 0) {
        toast({ title: "ไม่มีข้อมูล", description: "ไม่มีเคสฉุกเฉินที่มีพิกัดถูกต้อง" });
        return;
      }

      const validLocations = mapLocations.filter(
        (loc) =>
          loc.coordinates[0] !== 0 &&
          loc.coordinates[1] !== 0 &&
          !isNaN(loc.coordinates[0]) &&
          !isNaN(loc.coordinates[1])
      );

      if (validLocations.length === 0) {
        toast({ title: "ข้อผิดพลาด", description: "ไม่มีพิกัดที่ถูกต้องสำหรับแสดงบนแผนที่" });
        return;
      }

      if (validLocations.length === 1) {
        map.setView(validLocations[0].coordinates, 13);
      } else {
        const bounds = validLocations.reduce(
          (bounds, loc) => bounds.extend(L.latLng(loc.coordinates)),
          L.latLngBounds([])
        );
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดใน MapView:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถโหลดแผนที่ได้ กรุณาลองใหม่", variant: "destructive" });
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.warn("เกิดข้อผิดพลาดขณะทำความสะอาดแผนที่:", error);
        }
      }
    };
  }, [map, mapLocations, toast]);

  return (
    <FeatureGroup>
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
    </FeatureGroup>
  );
};

// Global CSS for markers (add to globals.css or component style)
MapView.displayName = "MapView"; // For dev tools
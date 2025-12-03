"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EmergencyCase } from "@/shared/types";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { MapPin, Navigation, Phone, User, Clock, Activity, Layers, ShieldAlert, Plus, Minus, Map as MapIcon, Globe } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { createRoot } from "react-dom/client";
import { cn } from "@lib/utils";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ==============================
// 🎨 Modern Color Palette
// ==============================
const getSeverityColor = (severity: number): string => {
  switch (severity) {
    case 4: return "#ef4444"; // Red-500
    case 3: return "#f97316"; // Orange-500
    case 2: return "#eab308"; // Yellow-500
    case 1: return "#22c55e"; // Green-500
    default: return "#94a3b8"; // Slate-400
  }
};

const getGradeLabel = (severity: number): string => {
  switch (severity) {
    case 4: return "Critical";
    case 3: return "Urgent";
    case 2: return "Moderate";
    case 1: return "General";
    default: return "Unknown";
  }
};

// ==============================
// 🎯 Custom Marker
// ==============================
const createCustomIcon = (severity: number, isSelected: boolean = false) => {
  const color = getSeverityColor(severity);
  const size = isSelected ? 24 : 16;
  
  return L.divIcon({
    className: "custom-marker-circle",
    html: `
      <div style="
        width: ${size}px; 
        height: ${size}px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// ==============================
// 🧩 Popup Content
// ==============================
const CasePopup = ({ emergencyCase, onTransferCase }: { emergencyCase: EmergencyCase, onTransferCase?: (id: string) => void }) => {
  return (
    <div className="w-[300px] font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", emergencyCase.severity >= 3 ? "bg-red-500" : "bg-green-500")} />
          <span className="text-sm font-bold tracking-wide uppercase">{emergencyCase.emergencyType}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">#{emergencyCase.id.slice(0, 4)}</span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 bg-white rounded-b-lg">
        {/* Patient & Location */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-slate-100 p-2 rounded-full shrink-0">
              <User className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">{emergencyCase.patientName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-3 w-3 text-slate-400" />
                <p className="text-xs text-slate-500">{emergencyCase.contactNumber}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-slate-100 p-2 rounded-full shrink-0">
              <MapPin className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{emergencyCase.location.address}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {format(new Date(emergencyCase.reportedAt), "d MMM HH:mm", { locale: th })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms & Description */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
          {emergencyCase.symptoms.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Symptoms</p>
              <div className="flex flex-wrap gap-1.5">
                {emergencyCase.symptoms.map((s, i) => (
                  <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {emergencyCase.description && (
            <div className="pt-2 border-t border-slate-200/50 mt-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Description</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {emergencyCase.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-1 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 text-xs border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${emergencyCase.location.coordinates.lat},${emergencyCase.location.coordinates.lng}`,
                "_blank"
              );
            }}
          >
            <Navigation className="h-3.5 w-3.5 mr-1.5" />
            Navigate
          </Button>
          {onTransferCase && emergencyCase.status === "assigned" && (
            <Button
              size="sm"
              className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              onClick={() => onTransferCase(emergencyCase.id)}
            >
              Assign Team
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==============================
// 🗺️ Real-Time Map Component
// ==============================
interface RealTimeMapProps {
  cases: EmergencyCase[];
  selectedCaseId?: string | null;
  onCaseSelect?: (caseId: string) => void;
  onTransferCase?: (caseId: string) => void;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RealTimeMap({
  cases,
  selectedCaseId = null,
  onCaseSelect,
  onTransferCase,
  className = "",
  autoRefresh = true,
  refreshInterval = 15000,
}: RealTimeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Initialize Map
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([13.7563, 100.5018], 12);

    mapInstanceRef.current = map;

    // Initial Tile Layer
    const googleRoadmap = 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}';
    const tileLayer = L.tileLayer(googleRoadmap, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mounted]);

  // Handle Map Type Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const googleRoadmap = 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}';
    const googleSatellite = 'https://mt0.google.com/vt/lyrs=s,h&hl=en&x={x}&y={y}&z={z}';

    const url = mapType === 'roadmap' ? googleRoadmap : googleSatellite;

    const tileLayer = L.tileLayer(url, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

  }, [mapType, mounted]);

  // Handle Markers & Selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    cases.forEach((emergencyCase) => {
      const isSelected = emergencyCase.id === selectedCaseId;
      const icon = createCustomIcon(emergencyCase.severity, isSelected);

      const marker = L.marker(
        [emergencyCase.location.coordinates.lat, emergencyCase.location.coordinates.lng],
        { icon }
      ).addTo(map);

      marker.on('click', () => {
        onCaseSelect?.(emergencyCase.id);
      });

      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);
      root.render(
        <CasePopup 
          emergencyCase={emergencyCase} 
          onTransferCase={onTransferCase} 
        />
      );
      
      marker.bindPopup(popupNode, {
        maxWidth: 320,
        className: 'custom-popup-clean',
        closeButton: false,
        offset: [0, -10]
      });

      markersRef.current[emergencyCase.id] = marker;

      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
          map.flyTo(
            [emergencyCase.location.coordinates.lat, emergencyCase.location.coordinates.lng],
            16,
            { duration: 1.5, easeLinearity: 0.25 }
          );
        }, 100);
      }
    });

    if (!selectedCaseId && cases.length > 0) {
      const bounds = L.latLngBounds(
        cases.map(c => [c.location.coordinates.lat, c.location.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

  }, [cases, selectedCaseId, onCaseSelect, onTransferCase]);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-500">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group isolate ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="h-full w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 z-0 bg-slate-100"
      />
      
      {/* 🟢 Top Floating Bar: Minimalist Stats */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 ring-1 ring-black/5 flex items-center gap-4 transition-all hover:bg-white dark:hover:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Live</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Active</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{cases.length}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Critical</span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              {cases.filter(c => c.severity >= 3).length}
            </span>
          </div>
        </div>
      </div>

      {/* ↘️ Bottom Right: Custom Controls */}
      <div className="absolute bottom-6 right-4 flex flex-col items-end gap-2 z-[400]">
        
        {/* Map Type Toggle */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-lg shadow-lg border border-white/20 ring-1 ring-black/5 flex flex-col gap-1">
          <Button
            size="icon"
            variant={mapType === 'roadmap' ? 'secondary' : 'ghost'}
            className="h-8 w-8 rounded-md"
            onClick={() => setMapType('roadmap')}
            title="Roadmap"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mapType === 'satellite' ? 'secondary' : 'ghost'}
            className="h-8 w-8 rounded-md"
            onClick={() => setMapType('satellite')}
            title="Satellite"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend Toggle */}
        <div className="relative flex flex-col items-end">
          {isLegendOpen && (
            <div className="mb-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2 min-w-[120px]">
                {[4, 3, 2, 1].map((severity) => (
                  <div key={severity} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: getSeverityColor(severity) }}
                    />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      {getGradeLabel(severity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-md bg-white hover:bg-slate-50 text-slate-600"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-white/20 ring-1 ring-black/5">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-600"
            onClick={() => mapInstanceRef.current?.zoomIn()}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-600"
            onClick={() => mapInstanceRef.current?.zoomOut()}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

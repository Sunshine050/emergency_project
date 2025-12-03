"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EmergencyCase, ApiRescueTeam } from "@/shared/types";
import { Button } from "@components/ui/button";
import { MapPin, Navigation, Phone, User, Clock, Ambulance, Layers, Plus, Minus, Map as MapIcon, Globe } from "lucide-react";
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

const getSeverityColor = (severity: number): string => {
  switch (severity) {
    case 4: return "#ef4444"; // Red-500
    case 3: return "#f97316"; // Orange-500
    case 2: return "#eab308"; // Yellow-500
    case 1: return "#22c55e"; // Green-500
    default: return "#94a3b8"; // Slate-400
  }
};

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

const createTeamIcon = (status: string) => {
  const isAvailable = status === "AVAILABLE";
  const color = isAvailable ? "#22c55e" : "#ef4444"; // Green or Red
  
  return L.divIcon({
    className: "custom-team-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ambulance"><path d="M10 10h4"/><path d="M14 14h-4"/><path d="M5 18h14"/><path d="M5 18v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/><path d="M19 18v-4a2 2 0 0 0-2-2h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const CasePopup = ({ emergencyCase }: { emergencyCase: EmergencyCase }) => {
  return (
    <div className="w-[280px] font-sans">
      <div className="bg-slate-900 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", emergencyCase.severity >= 3 ? "bg-red-500" : "bg-green-500")} />
          <span className="text-xs font-bold tracking-wide uppercase">{emergencyCase.emergencyType}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">#{emergencyCase.id.slice(0, 4)}</span>
      </div>

      <div className="p-3 space-y-3 bg-white rounded-b-lg">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <User className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{emergencyCase.patientName}</p>
              <p className="text-xs text-slate-500">{emergencyCase.contactNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-600 line-clamp-2">{emergencyCase.location.address}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Status</p>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            emergencyCase.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
          )}>
            {emergencyCase.status.replace("-", " ")}
          </span>
        </div>
      </div>
    </div>
  );
};

const TeamPopup = ({ team, activeCase }: { team: ApiRescueTeam, activeCase?: EmergencyCase }) => {
  return (
    <div className="w-[280px] font-sans">
      <div className="bg-slate-900 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-2">
          <Ambulance className="h-4 w-4 text-white" />
          <span className="text-xs font-bold tracking-wide">{team.name}</span>
        </div>
        <div className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
          team.status === "AVAILABLE" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        )}>
          {team.status}
        </div>
      </div>

      <div className="p-3 space-y-3 bg-white rounded-b-lg">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
            <p className="text-xs text-slate-600">{team.address} {team.city}</p>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
            <p className="text-xs text-slate-600">{team.contactPhone}</p>
          </div>
        </div>

        {activeCase && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Active Mission</p>
            <div className="bg-blue-50 p-2 rounded border border-blue-100">
              <p className="text-xs font-medium text-blue-900">{activeCase.emergencyType}</p>
              <p className="text-[10px] text-blue-700 mt-0.5">Patient: {activeCase.patientName}</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Status: {activeCase.status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface RescueMapProps {
  cases: EmergencyCase[];
  rescueTeams: ApiRescueTeam[];
  className?: string;
}

export function RescueMap({
  cases,
  rescueTeams,
  className = "",
}: RescueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const teamMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

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

  // Handle Map Type
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

  // Render Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    Object.values(teamMarkersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    teamMarkersRef.current = {};

    // 1. Render Cases
    cases.forEach((c) => {
      if (!c.location?.coordinates) return;
      
      const icon = createCustomIcon(c.severity);
      const marker = L.marker(
        [c.location.coordinates.lat, c.location.coordinates.lng],
        { icon }
      ).addTo(map);

      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);
      root.render(<CasePopup emergencyCase={c} />);
      
      marker.bindPopup(popupNode, {
        maxWidth: 300,
        className: 'custom-popup-clean',
        closeButton: false,
        offset: [0, -10]
      });

      markersRef.current[c.id] = marker;
    });

    // 2. Render Teams
    rescueTeams.forEach((team) => {
      if (!team.latitude || !team.longitude) return;

      const icon = createTeamIcon(team.status);
      const marker = L.marker(
        [team.latitude, team.longitude],
        { icon }
      ).addTo(map);

      // Find active case for this team
      // Note: This logic depends on how we link teams to cases. 
      // Assuming case.assignedTo === team.id or team.medicalInfo.currentEmergencyId === case.id
      const activeCase = cases.find(c => c.assignedTo === team.id || team.medicalInfo?.currentEmergencyId === c.id);

      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);
      root.render(<TeamPopup team={team} activeCase={activeCase} />);

      marker.bindPopup(popupNode, {
        maxWidth: 300,
        className: 'custom-popup-clean',
        closeButton: false,
        offset: [0, -10]
      });

      teamMarkersRef.current[team.id] = marker;
    });

    // Fit bounds if we have points
    const points: L.LatLngExpression[] = [];
    cases.forEach(c => {
      if (c.location?.coordinates) points.push([c.location.coordinates.lat, c.location.coordinates.lng]);
    });
    rescueTeams.forEach(t => {
      if (t.latitude && t.longitude) points.push([t.latitude, t.longitude]);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

  }, [cases, rescueTeams]);

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
      <div 
        ref={mapContainerRef} 
        className="h-full w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 z-0 bg-slate-100"
      />
      
      {/* Controls */}
      <div className="absolute bottom-6 right-4 flex flex-col items-end gap-2 z-[400]">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-lg shadow-lg border border-white/20 ring-1 ring-black/5 flex flex-col gap-1">
          <Button
            size="icon"
            variant={mapType === 'roadmap' ? 'secondary' : 'ghost'}
            className="h-8 w-8 rounded-md"
            onClick={() => setMapType('roadmap')}
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mapType === 'satellite' ? 'secondary' : 'ghost'}
            className="h-8 w-8 rounded-md"
            onClick={() => setMapType('satellite')}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
        
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

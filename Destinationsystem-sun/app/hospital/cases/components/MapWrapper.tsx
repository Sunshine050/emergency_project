// app/hospital/cases/components/MapWrapper.tsx
"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@components/dashboard/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-96 lg:h-[600px] flex items-center justify-center bg-slate-50 rounded-lg border">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-slate-500">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
});

import { MapLocation } from "../hooks/useHospitalCases";

interface MapWrapperProps {
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  setSelectedLocation: (loc: MapLocation | null) => void;
}

export default function MapWrapper({
  locations,
  selectedLocation,
  setSelectedLocation,
}: MapWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ล้าง DOM เก่าทุกครั้งก่อน render ใหม่
  useEffect(() => {
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative h-96 lg:h-[600px] rounded-lg overflow-hidden border"
    >
      <MapView
        locations={locations}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg z-10 max-w-sm">
          <p className="font-bold text-sm">{selectedLocation.title}</p>
          <p className="text-xs text-slate-600">ผู้ป่วย: {selectedLocation.patientName}</p>
          <p className="text-xs text-slate-600">ที่อยู่: {selectedLocation.address}</p>
          <div className="flex gap-2 mt-2">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
              selectedLocation.severity === 4 ? "bg-red-100 text-red-700" :
              selectedLocation.severity === 3 ? "bg-orange-100 text-orange-700" :
              selectedLocation.severity === 2 ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>
              Grade {selectedLocation.severity}
            </span>
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
              {selectedLocation.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Navigation, Activity, Cpu } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon@2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const vehiclePositions = [
  { id: "DL-01-AB-1234", lat: 28.6139, lng: 77.2090, status: "in_transit", driver: "Gurpreet Singh", speed: 68, route: "Delhi → Mumbai", fuel: 74, rpm: 1850 },
  { id: "MH-04-XY-9876", lat: 19.0760, lng: 72.8777, status: "available", driver: "Unassigned", speed: 0, route: "Mumbai → Pune", fuel: 85, rpm: 0 },
  { id: "KA-05-MN-4567", lat: 12.9716, lng: 77.5946, status: "available", driver: "Unassigned", speed: 0, route: "Bangalore → Chennai", fuel: 82, rpm: 0 },
  { id: "HR-38-KL-7788", lat: 28.4595, lng: 77.0266, status: "maintenance", driver: "Unassigned", speed: 0, route: "Gurgaon Depot", fuel: 45, rpm: 0 },
];

export default function TrackingMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<(typeof vehiclePositions)[0] | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    vehiclePositions.forEach((vehicle) => {
      const marker = L.marker([vehicle.lat, vehicle.lng])
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<div style="font-size:12px;min-width:180px;">
            <p style="font-weight:bold;color:#1e293b;">${vehicle.id}</p>
            <p style="color:#64748b;">Route: ${vehicle.route}</p>
            <p style="color:#64748b;">Driver: ${vehicle.driver}</p>
            <p style="color:#64748b;">Status: <span style="font-weight:bold;color:${vehicle.status === 'in_transit' ? '#059669' : vehicle.status === 'available' ? '#0284c7' : '#d97706'};">${vehicle.status.replace('_', ' ')}</span></p>
            ${vehicle.speed > 0 ? `<p style="color:#64748b;">Speed: ${vehicle.speed} km/h</p>` : ""}
          </div>`
        );
      marker.on("click", () => {
        setSelectedVehicle(vehicle);
        mapInstanceRef.current!.flyTo([vehicle.lat, vehicle.lng], 14, { duration: 1.5 });
      });
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-gradient-to-r from-sky-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 19 • IoT Telemetry
          </span>
          <h1 className="text-2xl font-black mt-2">Live GPS & IoT Device Engine</h1>
          <p className="text-xs text-sky-200 mt-1">Real-time vehicle speed, CAN Bus engine metrics, fuel sensors, and harsh braking alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {vehiclePositions.filter((v) => v.status === "in_transit").length} Online
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-sky-600" /> Pan-India GPS Corridors
          </h3>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            🟢 {vehiclePositions.length} Vehicles Tracked
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ height: "420px" }}>
          <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </div>

        {selectedVehicle && (
          <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0">
                {selectedVehicle.id.slice(0, 3)}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900">{selectedVehicle.id}</h3>
                <p className="text-xs text-slate-600 mt-1">Route: {selectedVehicle.route}</p>
                <p className="text-xs text-slate-600">Driver: {selectedVehicle.driver}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedVehicle.status === "in_transit"
                        ? "bg-emerald-100 text-emerald-700"
                        : selectedVehicle.status === "available"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {selectedVehicle.status.replace("_", " ")}
                  </span>
                  {selectedVehicle.speed > 0 && (
                    <span className="text-[10px] font-bold text-slate-500">
                      Speed: {selectedVehicle.speed} km/h
                    </span>
                  )}
                  {selectedVehicle.fuel > 0 && (
                    <span className="text-[10px] font-bold text-slate-500">
                      Fuel: {selectedVehicle.fuel}%
                    </span>
                  )}
                  {selectedVehicle.rpm > 0 && (
                    <span className="text-[10px] font-bold text-slate-500">
                      RPM: {selectedVehicle.rpm}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehiclePositions.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => {
              setSelectedVehicle(vehicle);
              mapInstanceRef.current?.flyTo([vehicle.lat, vehicle.lng], 14, { duration: 1.5 });
            }}
            className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${
              selectedVehicle?.id === vehicle.id
                ? "border-sky-500 shadow-lg shadow-sky-500/10"
                : "border-slate-100 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                  vehicle.status === "in_transit"
                    ? "bg-emerald-100 text-emerald-700"
                    : vehicle.status === "available"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {vehicle.id.slice(0, 3)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">{vehicle.id}</p>
                <p className="text-[10px] text-slate-500">{vehicle.route}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span
                  className={`font-bold ${
                    vehicle.status === "in_transit"
                      ? "text-emerald-600"
                      : vehicle.status === "available"
                      ? "text-sky-600"
                      : "text-amber-600"
                  }`}
                >
                  {vehicle.status.replace("_", " ")}
                </span>
              </div>
              {vehicle.speed > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Speed</span>
                  <span className="font-bold text-slate-700">{vehicle.speed} km/h</span>
                </div>
              )}
              {vehicle.fuel > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fuel</span>
                  <span className="font-bold text-slate-700">{vehicle.fuel}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

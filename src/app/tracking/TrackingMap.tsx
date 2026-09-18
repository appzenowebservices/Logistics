"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Navigation, Truck } from "lucide-react";

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
  { id: "DL-01-AB-1234", lat: 28.6139, lng: 77.2090, status: "in_transit", driver: "Gurpreet Singh", speed: 68, route: "Delhi → Mumbai" },
  { id: "MH-04-XY-9876", lat: 19.0760, lng: 72.8777, status: "available", driver: "Unassigned", speed: 0, route: "Mumbai → Pune" },
  { id: "KA-05-MN-4567", lat: 12.9716, lng: 77.5946, status: "available", driver: "Unassigned", speed: 0, route: "Bangalore → Chennai" },
  { id: "HR-38-KL-7788", lat: 28.4595, lng: 77.0266, status: "maintenance", driver: "Unassigned", speed: 0, route: "Gurgaon Depot" },
];

export default function TrackingMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [trackingInput, setTrackingInput] = useState("");
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
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach((m) => mapInstanceRef.current!.removeLayer(m));
    markersRef.current = [];

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
      markersRef.current.push(marker);
    });
  }, []);

  const handleTrack = () => {
    if (!trackingInput.trim()) return;
    const found = vehiclePositions.find(
      (v) => v.id.toLowerCase() === trackingInput.trim().toLowerCase()
    );
    if (found) {
      setSelectedVehicle(found);
      mapInstanceRef.current?.flyTo([found.lat, found.lng], 14, { duration: 1.5 });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
          Consignment & Vehicle Tracker
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Enter your AWB tracking code or vehicle registration to view real-time GPS position on OpenStreetMap.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Enter Tracking Number or Vehicle No. (e.g. ALMS-8839210 or DL-01-AB-1234)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={handleTrack}
            className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 hover:from-sky-500 hover:to-blue-500 transition-all"
          >
            <Navigation className="w-4 h-4" />
            Track Now
          </button>
        </div>

        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200" style={{ height: "420px" }}>
          <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </div>

        {selectedVehicle && (
          <div className="mt-4 bg-sky-50 rounded-2xl p-5 border border-sky-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0">
                {selectedVehicle.id.slice(0, 3)}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900">{selectedVehicle.id}</h3>
                <p className="text-xs text-slate-600 mt-1">Route: {selectedVehicle.route}</p>
                <p className="text-xs text-slate-600">Driver: {selectedVehicle.driver}</p>
                <div className="flex items-center gap-3 mt-2">
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

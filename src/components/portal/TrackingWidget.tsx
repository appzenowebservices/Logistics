"use client";

import React, { useState } from "react";
import { Search, MapPin, Truck, CheckCircle2, Clock, Navigation, ShieldCheck } from "lucide-react";

export default function TrackingWidget() {
  const [awbInput, setAwbInput] = useState("ALMS-8839210");
  const [trackingResult, setTrackingResult] = useState<any>({
    awb: "ALMS-8839210",
    client: "Reliance Retail Pvt Ltd",
    origin: "Delhi National Hub (DEL-HUB-01)",
    destination: "Mumbai Western Port Hub (MUM-HUB-02)",
    status: "In Transit on Highway NH-8",
    vehicle: "DL-01-AB-1234 (Tata Prima 4928.S)",
    driver: "Gurpreet Singh (+91-9876543210)",
    eta: "4 Hours 15 Mins",
    progress: 74,
    steps: [
      { label: "Booked & E-Way Bill Generated", time: "Oct 24, 08:30 AM", done: true },
      { label: "Loaded at Delhi National Hub", time: "Oct 24, 11:15 AM", done: true },
      { label: "Dispatched on Corridor NH-8", time: "Oct 24, 12:45 PM", done: true },
      { label: "Jaipur Checkpost Crossed", time: "Oct 24, 06:20 PM", done: true },
      { label: "Arrival at Mumbai Port Hub", time: "Estimated Tonight", done: false },
    ],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awbInput) return;
    setTrackingResult({
      awb: awbInput.toUpperCase(),
      client: "Priority Consignment Customer",
      origin: "Bangalore Tech Hub",
      destination: "New Delhi Logistics Yard",
      status: "Dispatched & Live GPS Tracking",
      vehicle: "MH-04-XY-9876 (Refrigerated Van)",
      driver: "Rajesh K. (Safety Rating: 4.9★)",
      eta: "On Schedule (Estimated Tomorrow)",
      progress: 60,
      steps: [
        { label: "Consignment Picked Up", time: "Today, 09:00 AM", done: true },
        { label: "Barcode Scanned & Manifested", time: "Today, 11:30 AM", done: true },
        { label: "High-Speed Transit Active", time: "Live GPS Ping", done: true },
        { label: "Unloading at Destination Hub", time: "Pending", done: false },
      ],
    });
  };

  return (
    <div className="max-w-5xl mx-auto -mt-10 relative z-30 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
              Real-Time AWB Tracking Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Track Consignment & Vehicle Telemetry
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live CAN Bus GPS Radar
          </span>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              placeholder="Enter AWB Tracking Number (e.g. ALMS-8839210 or DL-01-AB-1234)..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" /> Track Now
          </button>
        </form>

        {/* Tracking Output Card */}
        {trackingResult && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in">
            <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 rounded-2xl p-5 sm:p-6 border border-sky-100/80 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1: Status */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Tracking Number</span>
                <p className="text-lg font-black text-slate-900 font-mono">{trackingResult.awb}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Truck className="w-3.5 h-3.5" /> {trackingResult.status}
                </div>
                <p className="text-xs text-slate-600 font-medium">ETA: <strong className="text-sky-700">{trackingResult.eta}</strong></p>
              </div>

              {/* Col 2: Route */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Transit Corridor</span>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                  {trackingResult.origin}
                </div>
                <div className="border-l-2 border-dashed border-sky-300 ml-1 pl-3 py-1 text-[11px] text-slate-500">
                  Carrier: {trackingResult.vehicle}
                </div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {trackingResult.destination}
                </div>
              </div>

              {/* Col 3: Driver & Progress */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Assigned Driver</span>
                  <p className="text-xs font-bold text-slate-800">{trackingResult.driver}</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Journey Completed</span>
                    <span className="text-sky-600">{trackingResult.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-full transition-all duration-1000"
                      style={{ width: `${trackingResult.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline steps */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {trackingResult.steps.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs ${
                    s.done ? "bg-emerald-50/60 border-emerald-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px] uppercase">Step {idx + 1}</span>
                    {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <p className="font-bold">{s.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{s.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

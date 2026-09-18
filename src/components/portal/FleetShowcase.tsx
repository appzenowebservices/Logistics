"use client";

import React, { useState } from "react";
import { Cpu, Truck, Activity, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FleetShowcase() {
  const [activeTab, setActiveTab] = useState("container");

  const fleetTypes: Record<string, any> = {
    container: {
      name: "40ft Heavy Container Truck",
      model: "Tata Prima 4928.S / Ashok Leyland 5525",
      capacity: "28.50 to 40.0 Tons",
      sensors: ["CAN Bus Engine OBD Reader", "Door Open/Close Alarm", "Harsh Braking Accelerometer", "4G LTE SIM Dual-SIM Backup"],
      imageBg: "from-sky-900 to-slate-900",
      speed: "68 km/h Avg Highway",
    },
    reefer: {
      name: "Refrigerated Cold Chain Van",
      model: "BharatBenz 1617R Reefer / Eicher Pro",
      capacity: "7.50 Tons Temperature Controlled",
      sensors: ["Digital Humidity & Temp Sensor (-25°C to +15°C)", "Real-time Defrost Alert", "Fuel Theft Ultrasonic Sensor", "Panic Button Emergency Link"],
      imageBg: "from-emerald-900 to-teal-950",
      speed: "55 km/h Regulated",
    },
    mini: {
      name: "Last-Mile Express Pickup",
      model: "Mahindra Bolero Pickup / Ashok Leyland Dost",
      capacity: "1.75 to 3.50 Tons",
      sensors: ["Mini GPS Geo-fence Beacon", "Odometer Digital Sync", "Driver Fatigue Camera AI", "Instant QR E-POD Printer"],
      imageBg: "from-blue-900 to-indigo-950",
      speed: "45 km/h City Transit",
    },
  };

  const current = fleetTypes[activeTab];

  return (
    <section className="py-20 bg-white border-y border-sky-100 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left info */}
          <div className="lg:col-span-6 space-y-6">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">
              IoT Hardware & Fleet Telemetry
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Smart Fleet Built for Indian Highways
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every ALMS vehicle is integrated with proprietary IoT tracking devices transmitting over TLS 1.3 MQTT brokers directly to our Node.js tRPC backend.
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setActiveTab("container")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === "container"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🚛 40ft Containers
              </button>
              <button
                onClick={() => setActiveTab("reefer")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === "reefer"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ❄️ Refrigerated Vans
              </button>
              <button
                onClick={() => setActiveTab("mini")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === "mini"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🚐 Express Pickups
              </button>
            </div>

            <div className="pt-4 space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Embedded IoT Sensor Stack:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.sensors.map((s: string) => (
                  <div key={s} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/fleet-showcase"
                className="inline-flex items-center gap-2 font-bold text-xs text-sky-600 hover:text-sky-800"
              >
                Explore Complete Hardware PCB Specs & Certifications →
              </Link>
            </div>
          </div>

          {/* Right visual card */}
          <div className="lg:col-span-6">
            <div className={`bg-gradient-to-br ${current.imageBg} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-sky-400/30`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-6 border-b border-white/15">
                <span className="text-xs font-mono text-sky-300 bg-white/10 px-3 py-1 rounded-full">
                  ALMS Telemetry Unit v4.2
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 4G LTE Live
                </span>
              </div>

              <div className="py-12 text-center space-y-4 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto border border-white/20 shadow-xl">
                  <Truck className="w-12 h-12 text-sky-400 animate-pulse" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{current.name}</h3>
                <p className="text-xs text-sky-200 font-mono">{current.model}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/15 text-center">
                <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Payload Capacity</p>
                  <p className="text-sm font-black text-white mt-0.5">{current.capacity}</p>
                </div>
                <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Cruising Velocity</p>
                  <p className="text-sm font-black text-emerald-300 mt-0.5">{current.speed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

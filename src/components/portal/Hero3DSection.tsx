"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Truck, Package, Shield, Globe, ArrowRight, Sparkles, Navigation, Play } from "lucide-react";

export default function Hero3DSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-sky-800/40"
    >
      {/* Animated background lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Col: Headline */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wider uppercase animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Enterprise Logistics Ecosystem v4.2
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
            Smart Logistics <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
              Smart Fleet • Smart Business
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            ADDies Logistics Management System (ALMS) replaces fragmented tools with an end-to-end Node.js & tRPC Cloud ERP. Experience 16 Role-Based Portals, Live GPS Corridor Telemetry, Barcode Warehousing, and AI Demand Forecasting.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Launch Role ERP Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/tracking"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 backdrop-blur-md transition-all"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              <span>Track Live AWB Consignment</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-sky-400">142+</p>
              <p className="text-[11px] text-slate-400 font-medium">Pan-India Fleet</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">16</p>
              <p className="text-[11px] text-slate-400 font-medium">Dedicated Portals</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">99.8%</p>
              <p className="text-[11px] text-slate-400 font-medium">On-Time Delivery</p>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive 3D Perspective Truck/Globe Visual Simulation */}
        <div className="lg:col-span-5 flex justify-center perspective-1000">
          <div
            style={{
              transform: `rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg)`,
              transition: "transform 0.1s ease-out",
            }}
            className="w-full max-w-md bg-gradient-to-br from-slate-900/90 via-sky-950/80 to-slate-900/90 rounded-3xl p-6 border border-sky-400/30 shadow-[0_25px_60px_-15px_rgba(14,165,233,0.3)] backdrop-blur-xl relative"
          >
            {/* 3D Hologram header badge */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-300">Live Satellite Telemetry 3D</span>
              </div>
              <span className="font-mono text-[10px] text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded border border-sky-400/30">
                MQTT Broker Sync
              </span>
            </div>

            {/* Interactive 3D Truck Illustration Graphic */}
            <div className="my-6 relative bg-gradient-to-b from-sky-900/40 to-slate-900/80 rounded-2xl p-6 border border-sky-500/20 text-center overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-sky-500/20 rounded-full blur-xl" />
              
              {/* Animated 3D Floating Truck Representation */}
              <div className="py-6 flex flex-col items-center justify-center space-y-3 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-sky-500/50 transform hover:scale-110 transition-transform cursor-pointer">
                  <Truck className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="font-extrabold text-sm text-white">Tata Prima 4928.S (40ft Container)</div>
                <div className="text-[11px] text-sky-300 font-mono">Reg: DL-01-AB-1234 • Corridor: NH-8 Delhi ↔ Mumbai</div>
              </div>

              {/* Highway speed tracker */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-left">
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <p className="text-[9px] text-slate-400">Speed</p>
                  <p className="text-xs font-black text-sky-400">68 km/h</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <p className="text-[9px] text-slate-400">Engine RPM</p>
                  <p className="text-xs font-black text-emerald-400">1850 RPM</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <p className="text-[9px] text-slate-400">Cargo Temp</p>
                  <p className="text-xs font-black text-amber-400">4.2°C</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> Pan-India CAN Bus Radar
              </span>
              <Link href="/fleet-showcase" className="text-sky-300 font-bold hover:underline">
                Explore Hardware Specs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

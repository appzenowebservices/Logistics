"use client";

import React from "react";
import Link from "next/link";
import { Truck, Warehouse, Navigation, ReceiptIndianRupee, Users, ShieldCheck, Sparkles, ArrowRight, Cpu, Building2 } from "lucide-react";

export default function ServicesGrid() {
  const modules = [
    {
      title: "Fleet & Maintenance Master",
      desc: "Complete registration records, FASTag auto-recharge alerts, PUC/Fitness permit tracking, tyre wear lifecycle, and breakdown logs.",
      icon: Truck,
      color: "from-sky-500 to-blue-600",
      tag: "Module 4",
    },
    {
      title: "Warehouse & Barcode Engine",
      desc: "Inbound/outbound cross-docking, real-time QR scanner simulation, multi-tier rack & bin capacity tracking, and cycle count logs.",
      icon: Warehouse,
      color: "from-emerald-500 to-teal-600",
      tag: "Module 17",
    },
    {
      title: "CAN Bus & OBD IoT Platform",
      desc: "Live GPS corridor telemetry, engine RPM monitoring, harsh braking/acceleration alerts, and refrigerated van temperature gauges.",
      icon: Navigation,
      color: "from-indigo-500 to-purple-600",
      tag: "Module 19",
    },
    {
      title: "Corporate Freight Billing",
      desc: "Automated GST/TDS invoice generation, rate contract tariff engines, freight billing calculation, and multi-currency vendor settlement.",
      icon: ReceiptIndianRupee,
      color: "from-amber-500 to-orange-600",
      tag: "Module 21",
    },
    {
      title: "Driver App (Android PWA)",
      desc: "Turn-by-turn navigation, instant e-POD photo upload, digital consignee signature capture, fuel receipt logging, and trip attendance.",
      icon: Users,
      color: "from-rose-500 to-pink-600",
      tag: "Module 11",
    },
    {
      title: "16 Role-Based Access Portals",
      desc: "Strict defense-in-depth governance with tailored screens for Super Admin, CXO, Dispatcher, Warehouse Lead, Gate Security & Clients.",
      icon: ShieldCheck,
      color: "from-cyan-500 to-sky-600",
      tag: "Module 2",
    },
  ];

  return (
    <section className="py-20 bg-[#f0f8ff] px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Enterprise Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            25+ Integrated Logistics Modules
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Designed specifically for pan-India logistics operators. Every operational step from booking quote to e-POD financial settlement is modular and connected.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="bg-white rounded-3xl p-7 border border-sky-100 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <mod.icon className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold font-mono border border-slate-200">
                    {mod.tag}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/services"
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Explore Module Specs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-slate-400 font-semibold">Node.js / tRPC</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xl transition-all"
          >
            <span>View All 35 ERP Modules & Features</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

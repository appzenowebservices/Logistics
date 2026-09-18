"use client";

import React from "react";
import { MapPin, Globe, ShieldCheck, Award } from "lucide-react";

export default function NetworkStats() {
  const stats = [
    { label: "Active Pan-India Hubs", val: "24 Hubs", desc: "Delhi, Mumbai, Bangalore, Chennai, Kolkata & Pune" },
    { label: "Daily Shipments Handled", val: "12,500+", desc: "Priority Express & Corporate Heavy Consignments" },
    { label: "Fleet IoT Devices Online", val: "1,420 Units", desc: "Dual-SIM CAN Bus & OBD trackers transmitting 24x7" },
    { label: "Enterprise SLA Compliance", val: "99.8%", desc: "ISO 27001 Certified & GST E-Invoice compliant" },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-sky-900 via-blue-950 to-slate-950 text-white px-4 sm:px-6 lg:px-8 font-sans border-t border-sky-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 space-y-2 text-center hover:bg-white/15 transition-all">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent">
                {s.val}
              </p>
              <h3 className="font-bold text-sm text-white">{s.label}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

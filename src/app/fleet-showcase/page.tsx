"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import FleetShowcase from "@/components/portal/FleetShowcase";
import { Cpu, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function FleetShowcaseRoutePage() {
  return (
    <PortalLayout>
      <div className="py-12 bg-[#f0f8ff]">
        <FleetShowcase />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <Cpu className="w-10 h-10 text-sky-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">Custom PCB Design</h3>
              <p className="text-xs text-slate-500">Dual-SIM 4G LTE communication with OTA firmware update capability.</p>
            </div>
            <div className="space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">ISO 16750 Automotive Certified</h3>
              <p className="text-xs text-slate-500">Surge protection up to 60V and IP67 waterproof enclosure.</p>
            </div>
            <div className="space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">OBD-II & CAN Bus Readers</h3>
              <p className="text-xs text-slate-500">Direct engine diagnostic data stream to Node.js tRPC server.</p>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

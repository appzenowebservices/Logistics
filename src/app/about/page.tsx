"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Building2, Award, Users, MapPin } from "lucide-react";

export default function AboutRoutePage() {
  return (
    <PortalLayout>
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f0f8ff]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase">
              About ADDies Logistics
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
              Re-Engineering Indian Supply Chains
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              ADDies Logistics Management System (ALMS) was founded with a single mission: bring real-time IoT transparency and Role-Based security to complex transport ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-3xl border border-sky-100 shadow-lg">
              <Building2 className="w-10 h-10 text-sky-600 mx-auto mb-3" />
              <h3 className="text-xl font-black text-slate-900">National Presence</h3>
              <p className="text-xs text-slate-500 mt-1">24 regional logistics parks and warehousing complexes across India.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-sky-100 shadow-lg">
              <Users className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-xl font-black text-slate-900">1,400+ Drivers</h3>
              <p className="text-xs text-slate-500 mt-1">Empowered with dedicated Android PWA apps and instant e-POD signature terminals.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-sky-100 shadow-lg">
              <Award className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-black text-slate-900">ISO 27001 Security</h3>
              <p className="text-xs text-slate-500 mt-1">Strict 16-Role defense-in-depth authorization powered by Node.js & tRPC.</p>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

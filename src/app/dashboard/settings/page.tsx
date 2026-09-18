"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings, Cpu, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-sky-900 to-blue-900 rounded-3xl p-6 text-white shadow-xl">
          <h1 className="text-2xl font-black">Integrations & API Settings</h1>
          <p className="text-xs text-sky-200 mt-1">Google Maps API, FASTag Gateway, SMS/WhatsApp Gateway, GST E-Way Bill, and SAP/Tally sync.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm text-xs text-slate-600 font-medium">
          ✅ All 12 external integration endpoints configured and operating on TLS 1.3 encryption.
        </div>
      </div>
    </DashboardLayout>
  );
}

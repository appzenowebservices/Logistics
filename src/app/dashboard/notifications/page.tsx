"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, AlertTriangle, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
          <h1 className="text-2xl font-black">Multi-Channel Notifications Engine</h1>
          <p className="text-xs text-sky-200 mt-1">SMS, Email, WhatsApp, Push Alerts, and Webhook dispatch triggers.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-3">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900">
            ⚠️ Alert: DL-01-AB-1234 harsh braking detected on NH-8 Jaipur Corridor.
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900">
            ✅ Success: Reliance Express booking order #ALMS-9940312 scheduled.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

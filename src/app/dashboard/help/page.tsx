"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { HelpCircle, BookOpen } from "lucide-react";

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-navy-900 rounded-3xl p-6 text-white shadow-xl">
          <h1 className="text-2xl font-black">ALMS User Manuals & Help Center</h1>
          <p className="text-xs text-primary-200 mt-1">Documentation, FAQs, and ticket escalation support.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm text-xs text-slate-600">
          Need operational assistance? Contact ALMS support desk at support@alms.com or call 1800-ADD-LOGIS.
        </div>
      </div>
    </DashboardLayout>
  );
}

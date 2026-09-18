"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart3, FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { title: "Pan-India Daily Revenue & Margin Report", cat: "Financial" },
    { title: "Vehicle Idle Time & Fuel Efficiency Log", cat: "Fleet IoT" },
    { title: "Driver Trip Attendance & Performance", cat: "HR / Drivers" },
    { title: "Warehouse Bin Occupancy & Turnaround", cat: "Warehousing" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-sky-900 to-blue-900 rounded-3xl p-6 text-white shadow-xl">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 24 • Reporting Engine
          </span>
          <h1 className="text-2xl font-black mt-2">Enterprise Logistics Reports Library (200+ Reports)</h1>
          <p className="text-xs text-sky-200 mt-1">Export operational, financial, GPS telemetry, and GST reports in Excel & PDF format.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => (
            <div key={r.title} className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">{r.cat}</span>
                <p className="font-bold text-sm text-slate-800 mt-2">{r.title}</p>
              </div>
              <button className="p-2.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

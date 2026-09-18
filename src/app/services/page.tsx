"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Truck, Warehouse, Navigation, ReceiptIndianRupee, ShieldCheck, Users, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";

export default function ServicesRoutePage() {
  const allModules = [
    { cat: "Corporate Governance", list: ["Company Profile & GST", "RBAC User Management", "Organization Hierarchy", "Multi-Branch Management"] },
    { cat: "Fleet Ecosystem", list: ["Vehicle Master & Registration", "Permit & Fitness Expiry", "FASTag Wallet Integration", "Tyre Wear Lifecycle"] },
    { cat: "Logistics Operations", list: ["Booking & Quotation Engine", "Fragile / Dangerous Goods Tags", "Trip Planning & Allocation", "Automated Manifest Sheet"] },
    { cat: "Warehousing & Barcode", list: ["Inbound / Outbound Scans", "QR Code Simulator", "Multi-tier Rack Locators", "Cycle Count & Repacking"] },
    { cat: "Live GPS & IoT Engine", list: ["Real-time Vehicle Speed", "Harsh Deceleration Alerts", "Engine RPM & CAN Bus Sync", "Refrigerated Van Temp Sensors"] },
    { cat: "Finance, HR & CRM", list: ["Automated GST Freight Billing", "Driver Attendance & Payroll", "Corporate Key Account Contracts", "200+ Exportable Reports"] },
  ];

  return (
    <PortalLayout>
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f0f8ff]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase">
              Modular Architecture
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
              35 Integrated Logistics Modules
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Built on Node.js and tRPC for real-time responsiveness across thousands of concurrent dispatchers and warehouse scanners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allModules.map((grp) => (
              <div key={grp.cat} className="bg-white rounded-3xl p-7 border border-sky-100 shadow-lg space-y-4">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" /> {grp.cat}
                </h3>
                <ul className="space-y-3">
                  {grp.list.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

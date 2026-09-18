"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Warehouse, QrCode, Box, ArrowRight } from "lucide-react";

export default function WarehousePage() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-3xl p-6 text-white shadow-xl">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 17 • Warehousing
          </span>
          <h1 className="text-2xl font-black mt-2">Bhiwandi Hub Stock & Rack Management</h1>
          <p className="text-xs text-emerald-100 mt-1">Cross dock, barcode scanning, bin location, and cycle counts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" /> Stock Inbound Scanner
            </h3>
            <p className="text-xs text-slate-500">Scan incoming pallet barcodes to log shelf placement.</p>
            <div className="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-3">
              <QrCode className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
              <button
                onClick={() => setScanResult("SKU-99042: Assigned to Bin Shelf C-14")}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
              >
                Scan Pallet Barcode
              </button>
            </div>
            {scanResult && <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl">✅ {scanResult}</p>}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Bin Occupancy Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Rack Zone A</span>
                <span className="text-emerald-600">84% Full</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[84%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

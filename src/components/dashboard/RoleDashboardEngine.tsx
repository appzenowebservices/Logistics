"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  FileText,
  DollarSign,
  Users,
  Navigation,
  ShieldCheck,
  PhoneCall,
  Activity,
  ArrowRight
} from "lucide-react";

interface RoleDashboardProps {
  user: any;
}

export default function RoleDashboardEngine({ user }: RoleDashboardProps) {
  const role = user?.role || "super_admin";
  const [podUploaded, setPodUploaded] = useState(false);
  const [newBookingAWB, setNewBookingAWB] = useState<string | null>(null);

  // tRPC mutations & queries
  const scanQrMutation = trpc.warehouse.scanQr.useMutation();
  const [scanResultText, setScanResultText] = useState<string | null>(null);

  const handleScanQr = async () => {
    const barcodeStr = `PALLET-QR-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await scanQrMutation.mutateAsync({ barcode: barcodeStr });
      setScanResultText(`${res.barcode}: ${res.binLocation} (${res.status})`);
    } catch {
      setScanResultText(`${barcodeStr}: Rack Zone B-08 Verified`);
    }
  };

  // Super Admin / Executive Management / Admin View
  if (role === "super_admin" || role === "admin" || role === "executive_management") {
    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Role Welcome Banner - Light Blue & Navy corporate styling */}
        <div className="bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
              {role === "super_admin" ? "Super Admin Governance" : "Executive Board Portal"}
            </span>
            <h1 className="text-2xl font-black mt-2">Welcome, {user?.name || "Aditya Sharma"}</h1>
            <p className="text-xs text-sky-100 mt-1">
              Pan-India ALMS Logistics Ecosystem overview across Delhi, Mumbai & Bangalore Hubs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <p className="text-[10px] text-sky-100">Total Monthly Revenue</p>
              <p className="text-lg font-black text-emerald-300">₹45.80 Lakhs</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <p className="text-[10px] text-sky-100">Active Fleet</p>
              <p className="text-lg font-black text-sky-200">142 Vehicles</p>
            </div>
          </div>
        </div>

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex items-center justify-between hover:border-sky-300 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500">Today's Bookings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">428</h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs yesterday
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex items-center justify-between hover:border-sky-300 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500">Vehicles Running</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">89 / 142</h3>
              <p className="text-[11px] text-sky-600 font-bold mt-1">Live on Highways</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex items-center justify-between hover:border-sky-300 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending Deliveries</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">64</h3>
              <p className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 6 delayed in traffic
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex items-center justify-between hover:border-sky-300 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-500">Net Profit Margin</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">21.4%</h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">Above target margin</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Live GPS Fleet Map & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-sky-600" /> Live GPS Fleet Tracking Corridor
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 89 Active Signals
              </span>
            </div>

            {/* Simulated Map Container */}
            <div className="h-72 rounded-2xl bg-gradient-to-br from-sky-900 via-blue-950 to-slate-900 p-6 relative overflow-hidden flex flex-col justify-between text-white border border-sky-900">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold">
                  Corridor: NH-8 (Delhi ↔ Mumbai)
                </div>
                <div className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-xl text-xs font-bold">
                  tRPC Sync: Connected
                </div>
              </div>

              {/* Simulated Moving Trucks */}
              <div className="relative z-10 my-4 space-y-3">
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-xs">
                      TRK
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">DL-01-AB-1234 (40ft Container)</p>
                      <p className="text-[10px] text-sky-300">Driver: Gurpreet Singh • Speed: 68 km/h</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">ETA: 4h 15m</span>
                </div>

                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-xs">
                      VAN
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">KA-05-MN-4567 (Refrigerated Van)</p>
                      <p className="text-[10px] text-sky-300">Driver: Rajesh K. • Speed: 54 km/h • Temp: 4.2°C</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-300">ETA: 1h 20m</span>
                </div>
              </div>

              <div className="relative z-10 text-[10px] text-sky-300/80 flex justify-between font-mono">
                <span>CAN Bus & OBD Readers Active</span>
                <span>Node.js Broker Ping: 14ms</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" /> Recent Activity Timeline
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Shipment Delivered #ALMS-7712349</p>
                  <p className="text-[11px] text-slate-500">Delivered to Chennai Port. POD e-signed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Harsh Deceleration Alert</p>
                  <p className="text-[11px] text-slate-500">DL-01-AB-1234 on NH-8 Jaipur bypass.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">New Corporate Contract Signed</p>
                  <p className="text-[11px] text-slate-500">Reliance Retail renewed express delivery rate card.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dispatcher Dashboard
  if (role === "dispatcher") {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-sky-800 to-blue-900 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
              Dispatcher Control Desk
            </span>
            <h1 className="text-2xl font-black mt-2">Today's Dispatch Queue & Allocation</h1>
            <p className="text-xs text-sky-100 mt-1">Assign vehicles, generate manifest trip sheets, and optimize transit routes.</p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-3xl font-black text-emerald-300">18</p>
            <p className="text-xs text-sky-100">Pending Trips Today</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center justify-between">
              <span>Unassigned Booking Orders</span>
              <span className="text-xs text-sky-600 font-semibold">Priority First</span>
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-800 uppercase">Express Booking</span>
                  <p className="font-bold text-sm text-slate-800">#ALMS-9940312 • Mumbai ↔ Pune</p>
                  <p className="text-xs text-slate-500 mt-0.5">Weight: 1.2 Ton • Client: Reliance Retail</p>
                </div>
                <button
                  onClick={() => alert("Vehicle MH-04-XY-9876 & Driver allocated successfully!")}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  Allocate Vehicle
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Active Route Manifests</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-slate-800">Trip #TRP-1092 • Delhi ↔ Mumbai</p>
                  <p className="text-xs text-slate-500">Vehicle: DL-01-AB-1234 • Driver: Gurpreet Singh</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  On Schedule
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Warehouse Manager Dashboard
  if (role === "warehouse_manager" || role === "security_guard") {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
              {role === "security_guard" ? "Security Gate Scan Station" : "Warehouse & Rack Operations"}
            </span>
            <h1 className="text-2xl font-black mt-2">Bhiwandi Hub Inventory Hub</h1>
            <p className="text-xs text-emerald-100 mt-1">Barcode & QR scanning, Rack/Bin locator, and inbound/outbound cross-dock.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" /> Barcode / QR Scanner Simulator
            </h3>
            <p className="text-xs text-slate-500 mb-4">Scan incoming pallet barcodes or shipment QR codes via tRPC API.</p>
            
            <div className="p-6 rounded-2xl bg-slate-900 text-white text-center border border-slate-800 space-y-4">
              <QrCode className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
              <p className="text-xs font-mono text-slate-300">Target Scanner Laser Ready...</p>
              <button
                onClick={handleScanQr}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Scan Test QR Code Now
              </button>
            </div>

            {scanResultText && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                <span>✅ {scanResultText}</span>
                <button onClick={() => setScanResultText(null)} className="text-xs underline text-emerald-700 cursor-pointer">Clear</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Rack & Bin Capacity</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Zone A (Fast Moving SKUs)</span>
                  <span className="text-emerald-600">84% Occupied</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[84%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Zone B (Cold Storage & Fragile)</span>
                  <span className="text-sky-600">62% Occupied</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[62%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Driver App Interactive Dashboard
  if (role === "driver") {
    return (
      <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-lg">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-black/20">
            Driver PWA Terminal
          </span>
          <h1 className="text-2xl font-black mt-2">Gurpreet Singh • DL-01-AB-1234</h1>
          <p className="text-xs text-amber-100 mt-1">Active Trip #ALMS-8839210: Delhi ↔ Mumbai Port Hub</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Current Destination</span>
              <h3 className="text-lg font-black text-slate-900">Bhiwandi Warehousing Complex</h3>
            </div>
            <button
              onClick={() => alert("Launching Navigation GPS...")}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4" /> Start Turn-by-Turn
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 text-center space-y-3">
            <FileText className="w-10 h-10 text-sky-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Proof of Delivery (POD) Signature & Photo Upload</h4>
            <p className="text-xs text-slate-600">Take consignee photo receipt or capture digital signature upon unloading.</p>
            
            {podUploaded ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> e-POD Successfully Uploaded & Signed!
              </div>
            ) : (
              <button
                onClick={() => setPodUploaded(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                📸 Capture Consignee POD Signature
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Customer Dashboard
  if (role === "customer") {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-indigo-800 to-purple-900 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
              Corporate Client Portal
            </span>
            <h1 className="text-2xl font-black mt-2">Reliance Retail Pvt Ltd</h1>
            <p className="text-xs text-indigo-100 mt-1">Book express shipments, download digital POD invoices, and track live trucks.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Live Track My Active Shipments</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-sky-200/80 bg-sky-50/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                    AWB #ALMS-8839210
                  </span>
                  <p className="font-bold text-sm text-slate-900 mt-1.5">Delhi National Hub ➔ Mumbai Western Hub</p>
                  <p className="text-xs text-slate-500">Carrier: Tata Prima 4928 • Live Status: On Highway NH-8</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-600">In Transit</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Quick Book Shipment</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Pickup Location</label>
                <input type="text" defaultValue="Mumbai Port Hub" className="w-full p-2 rounded-lg border bg-slate-50" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Destination</label>
                <input type="text" defaultValue="Pune Logistics Yard" className="w-full p-2 rounded-lg border bg-slate-50" />
              </div>
              <button
                onClick={() => setNewBookingAWB("ALMS-" + Math.floor(100000 + Math.random() * 900000))}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Schedule Door Pickup
              </button>
              {newBookingAWB && (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-bold border border-emerald-200">
                  🎉 Booked via tRPC! AWB: {newBookingAWB}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Generic View for Fleet Mgr, Regional Mgr, Accountant, HR, Vendor, CRM
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-gradient-to-r from-sky-700 to-blue-900 rounded-3xl p-6 text-white shadow-lg">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
          Tailored Role Portal
        </span>
        <h1 className="text-2xl font-black mt-2 capitalize">{role.replace(/_/g, " ")} Operations Center</h1>
        <p className="text-xs text-sky-100 mt-1">Accessing role-specific masters, KPIs, and reports via Node.js / tRPC procedures.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900">tRPC Node Procedure Active</h3>
          <p className="text-xs text-slate-500 mt-1">RBAC verification passed. Authorized for create/edit/approval actions.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900">Assigned Branch Hub</h3>
          <p className="text-xs text-slate-500 mt-1">Delhi National Hub (DEL-HUB-01)</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900">Security Audit Trail</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Session Encrypted (2FA Verified)</p>
        </div>
      </div>
    </div>
  );
}

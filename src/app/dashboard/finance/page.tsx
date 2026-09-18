"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReceiptIndianRupee, DollarSign, FileSpreadsheet } from "lucide-react";

export default function FinancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-xl">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 21 • Finance & Accounts
          </span>
          <h1 className="text-2xl font-black mt-2">Freight Billing, GST & Cash Ledger</h1>
          <p className="text-xs text-emerald-100 mt-1">Manage corporate invoices, TDS deductions, FASTag toll expenses, and vendor payouts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Monthly Billing Revenue</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">₹45,80,000</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Pending Corporate Outstanding</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">₹6,40,000</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Vendor Payments Due</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹3,15,000</h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

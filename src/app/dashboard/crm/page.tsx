"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserCheck, Sparkles } from "lucide-react";

export default function CrmPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 23 • CRM & Support
          </span>
          <h1 className="text-2xl font-black mt-2">Corporate Client Contracts & Leads</h1>
          <p className="text-xs text-purple-200 mt-1">Manage rate contracts with Reliance Retail, Flipkart Logistics, and Tata Motors.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
          <h3 className="font-bold text-base text-slate-900">Active Key Account Clients</h3>
          <p className="text-xs text-slate-500 mt-1">Reliance Retail Pvt Ltd • Credit Limit: ₹25,00,000 • Active Contract: Standard Express</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

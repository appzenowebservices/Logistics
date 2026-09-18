"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ShieldCheck, Lock, Users } from "lucide-react";

export default function AdministrationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 2 • Security & Access
          </span>
          <h1 className="text-2xl font-black mt-2">Role-Based Access Control (RBAC) Governance</h1>
          <p className="text-xs text-sky-200 mt-1">Manage 16 distinct role permissions (Create, Edit, Delete, Approve, Export), 2FA, and Audit Logs.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 mb-2">Active Roles Configured</h3>
          <p className="text-xs text-slate-500">Super Admin, Executive Board, Regional Manager, Branch Manager, Dispatcher, Warehouse Lead, Fleet Supervisor, Driver, Corporate Client, Vendor, Accountant, HR Manager, CRM Executive, Support Lead, Gate Security.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

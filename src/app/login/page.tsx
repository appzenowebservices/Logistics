"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import PortalLayout from "@/components/portal/PortalLayout";
import {
  Shield,
  Truck,
  Users,
  Building2,
  Warehouse,
  Briefcase,
  UserCheck,
  ReceiptIndianRupee,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const DEMO_CREDENTIALS: Record<string, { email: string; password: string }> = {
  super_admin: { email: "superadmin@alms.com", password: "password123" },
  executive_management: { email: "cxo@alms.com", password: "password123" },
  admin: { email: "admin@alms.com", password: "password123" },
  regional_manager: { email: "regional@alms.com", password: "password123" },
  branch_manager: { email: "branch@alms.com", password: "password123" },
  dispatcher: { email: "dispatcher@alms.com", password: "password123" },
  fleet_manager: { email: "fleet@alms.com", password: "password123" },
  warehouse_manager: { email: "warehouse@alms.com", password: "password123" },
  security_guard: { email: "security@alms.com", password: "password123" },
  driver: { email: "driver@alms.com", password: "password123" },
  customer: { email: "customer@alms.com", password: "password123" },
  vendor: { email: "vendor@alms.com", password: "password123" },
  accountant: { email: "accountant@alms.com", password: "password123" },
  hr: { email: "hr@alms.com", password: "password123" },
  crm_executive: { email: "crm@alms.com", password: "password123" },
  support_executive: { email: "support@alms.com", password: "password123" },
};

export default function LoginRoutePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation();
  const seedMutation = trpc.seed.run.useMutation();

  useEffect(() => {
    seedMutation.mutate();
  }, []);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRole("standard");
    setError("");

    try {
      const res = await loginMutation.mutateAsync({ email, password });
      if (res.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoadingRole(null);
    }
  };

  const handleRoleQuickLogin = async (roleKey: string) => {
    setLoadingRole(roleKey);
    setError("");

    try {
      const res = await loginMutation.mutateAsync({ role: roleKey });
      if (res.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to login as selected role");
    } finally {
      setLoadingRole(null);
    }
  };

  const roleCategories = [
    {
      title: "Executive & HQ Governance",
      roles: [
        { key: "super_admin", label: "Super Admin", desc: "Complete ERP Portal & System Settings", icon: Shield, color: "from-sky-600 to-blue-700" },
        { key: "executive_management", label: "Executive (COO/CXO)", desc: "Business KPIs, Revenue & Fleet Analytics", icon: BarChartIcon, color: "from-blue-600 to-indigo-700" },
        { key: "admin", label: "General Admin", desc: "User Master, Access & System Config", icon: Shield, color: "from-sky-500 to-cyan-600" },
      ]
    },
    {
      title: "Regional & Branch Leadership",
      roles: [
        { key: "regional_manager", label: "Regional Manager", desc: "State Hubs, Fleet Allocation & Margin Reports", icon: Building2, color: "from-cyan-600 to-teal-700" },
        { key: "branch_manager", label: "Branch Manager", desc: "Today's Bookings, Local Hub Dispatch & Expenses", icon: MapPin, color: "from-teal-600 to-emerald-700" },
      ]
    },
    {
      title: "Logistics Operations & Fleet",
      roles: [
        { key: "dispatcher", label: "Dispatcher", desc: "Trip Planning, Route Optimization & Manifests", icon: Briefcase, color: "from-blue-500 to-sky-600" },
        { key: "fleet_manager", label: "Fleet Manager", desc: "Vehicle Master, Maintenance, FASTag & GPS", icon: Truck, color: "from-sky-600 to-blue-800" },
        { key: "warehouse_manager", label: "Warehouse Manager", desc: "Barcode/QR Scanning, Racks & Stock Cycle", icon: Warehouse, color: "from-emerald-600 to-teal-800" },
        { key: "security_guard", label: "Security Guard", desc: "Warehouse Gate Entry/Exit & Material Check", icon: Lock, color: "from-slate-700 to-slate-900" },
      ]
    },
    {
      title: "Field & Client Portals",
      roles: [
        { key: "driver", label: "Driver App (PWA)", desc: "Assigned Trips, Navigation & POD Signature Upload", icon: Truck, color: "from-amber-600 to-orange-700" },
        { key: "customer", label: "Customer Portal", desc: "Live GPS Tracking, Shipment Booking & POD", icon: UserCheck, color: "from-indigo-600 to-purple-700" },
        { key: "vendor", label: "Vendor Portal", desc: "Assigned Vehicles, Trips & Payment Settlements", icon: Users, color: "from-purple-600 to-violet-800" },
      ]
    },
    {
      title: "Finance, HR & CRM Services",
      roles: [
        { key: "accountant", label: "Accountant", desc: "GST, TDS, Ledger, Cash Book & Freight Bills", icon: ReceiptIndianRupee, color: "from-emerald-700 to-green-800" },
        { key: "hr", label: "HR Manager", desc: "Driver & Employee Attendance, Payroll & Leaves", icon: Users, color: "from-rose-600 to-pink-700" },
        { key: "crm_executive", label: "CRM Executive", desc: "Leads, Quotations, Rate Cards & Follow-ups", icon: Sparkles, color: "from-amber-500 to-rose-600" },
        { key: "support_executive", label: "Support Executive", desc: "Tickets, Live Status & Customer Escalations", icon: UserCheck, color: "from-sky-600 to-indigo-600" },
      ]
    }
  ];

  return (
    <PortalLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#f0f8ff] min-h-[calc(100vh-200px)] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-10">
            <span className="px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider shadow-sm">
              Role-Based Access Control (RBAC) Node.js Portal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3">
              ALMS Enterprise Role Login
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
              Select any of the 16 operational roles below or sign in using standard email & password credentials.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Standard Email Login Form */}
            <div className="w-full lg:w-[420px] shrink-0 bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-sky-600" /> Account Credential Login
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Enter your official email or select any role from the instant switcher grid.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> {error}
                </div>
              )}

              <form onSubmit={handleStandardLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">User Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="superadmin@alms.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingRole === "standard"}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 font-bold text-sm text-white shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loadingRole === "standard" ? "Authenticating via tRPC..." : "Sign In to Portal"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-3 text-center">All Role Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {Object.entries(DEMO_CREDENTIALS).map(([role, creds]) => (
                    <div key={role} className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{role.replace(/_/g, " ")}</p>
                      <p className="text-[10px] font-mono text-slate-700 truncate">{creds.email}</p>
                      <p className="text-[10px] font-mono text-slate-500">{creds.password}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Role Access Panel */}
            <div className="flex-1 min-w-0 bg-white rounded-3xl p-6 border border-sky-100 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" /> Instant Role-Based Evaluation Grid
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Click any role to launch your tailored dashboard instantly.</p>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                  tRPC RBAC Active
                </span>
              </div>

              <div className="space-y-6 max-h-[640px] overflow-y-auto pr-2">
                {roleCategories.map((category) => (
                  <div key={category.title} className="space-y-2.5">
                    <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-sky-200 pb-1">
                      {category.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {category.roles.map((r) => {
                        const isLoading = loadingRole === r.key;
                        return (
                          <button
                            key={r.key}
                            onClick={() => handleRoleQuickLogin(r.key)}
                            disabled={isLoading}
                            className={`text-left p-3.5 rounded-2xl bg-gradient-to-br ${r.color} hover:brightness-110 transition-all shadow-md border border-white/20 group relative overflow-hidden flex flex-col justify-between cursor-pointer`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-extrabold text-sm text-white group-hover:translate-x-0.5 transition-transform">
                                {r.label}
                              </span>
                              <span className="p-1.5 rounded-lg bg-white/20 text-white shrink-0">
                                <r.icon className="w-4 h-4" />
                              </span>
                            </div>
                            <p className="text-[11px] text-white/80 mt-2 leading-tight">
                              {r.desc}
                            </p>
                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/20 text-[10px] font-bold text-white/90">
                              <span>{isLoading ? "Connecting tRPC..." : "Switch & View"}</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

function BarChartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  );
}

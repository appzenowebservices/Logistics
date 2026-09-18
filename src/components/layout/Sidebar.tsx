"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Briefcase,
  Truck,
  Users,
  Warehouse,
  ReceiptIndianRupee,
  UserCheck,
  BarChart3,
  Navigation,
  Bell,
  ShieldCheck,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  X,
  MapPin,
  Sparkles,
  Route,
  DollarSign,
  Activity,
  Globe,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  userRole?: string;
}

const rolePermissions: Record<string, string[]> = {
  super_admin: ["dashboard", "masters", "operations", "fleet", "drivers", "warehouse", "tracking", "geo", "finance", "crm", "reports", "notifications", "administration", "settings", "help", "ai_assistant", "ai_dispatch", "driver_scorecard", "route_calculator", "profit_center", "employee_portal", "vendor_portal", "workflow_builder", "integration_hub", "sustainability"],
  admin: ["dashboard", "masters", "operations", "fleet", "drivers", "warehouse", "tracking", "geo", "finance", "crm", "reports", "notifications", "settings", "ai_assistant", "ai_dispatch", "route_calculator", "profit_center", "employee_portal", "vendor_portal", "workflow_builder", "integration_hub"],
  executive_management: ["dashboard", "masters", "operations", "fleet", "reports", "ai_assistant", "profit_center", "sustainability"],
  regional_manager: ["dashboard", "masters", "operations", "fleet", "drivers", "reports", "route_calculator", "driver_scorecard"],
  branch_manager: ["dashboard", "booking", "dispatch", "notifications", "driver_scorecard", "route_calculator"],
  dispatcher: ["dashboard", "booking", "dispatch", "notifications", "ai_dispatch", "route_calculator"],
  fleet_manager: ["dashboard", "fleet", "drivers", "tracking", "reports", "ai_dispatch", "driver_scorecard", "route_calculator"],
  warehouse_manager: ["dashboard", "warehouse", "reports"],
  security_guard: ["dashboard", "warehouse", "notifications"],
  driver: ["dashboard", "tracking", "notifications"],
  customer: ["dashboard", "booking", "notifications"],
  vendor: ["dashboard", "vendor_portal", "notifications"],
  accountant: ["dashboard", "finance", "reports", "ai_assistant", "profit_center"],
  hr: ["dashboard", "drivers", "reports", "driver_scorecard", "employee_portal"],
  crm_executive: ["dashboard", "crm", "reports", "notifications"],
  support_executive: ["dashboard", "notifications", "crm"],
};

export default function Sidebar({ isOpen, onCloseMobile, userRole = "super_admin" }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Masters: false,
    Operations: true,
    Fleet: false,
  });

  const allowedMenus = rolePermissions[userRole] || [];

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard", key: "dashboard" },
    { title: "Masters", icon: Database, href: "/dashboard/masters", key: "masters", subItems: [
      { name: "Company Profile", href: "/dashboard/masters" },
      { name: "Branch Managers", href: "/dashboard/masters/branch-managers" },
      { name: "Pincode Areas", href: "/dashboard/masters/pincode-areas" },
      { name: "Rate Cards", href: "/dashboard/masters" },
    ]},
    { title: "Operations", icon: Briefcase, href: "/dashboard/booking", key: "operations", subItems: [
      { name: "Booking & Quotation", href: "/dashboard/booking" },
      { name: "Dispatch & Manifest", href: "/dashboard/dispatch" },
    ]},
    { title: "Fleet Management", icon: Truck, href: "/dashboard/fleet", key: "fleet" },
    { title: "Drivers & Compliance", icon: Users, href: "/dashboard/drivers", key: "drivers" },
    { title: "Warehouse & Stock", icon: Warehouse, href: "/dashboard/warehouse", key: "warehouse" },
    { title: "GPS & IoT Platform", icon: Navigation, href: "/dashboard/tracking", key: "tracking", badge: "LIVE" },
    { title: "Geo Intelligence Center", icon: MapPin, href: "/dashboard/geo-intelligence", key: "geo" },
    { title: "Finance & Accounts", icon: ReceiptIndianRupee, href: "/dashboard/finance", key: "finance" },
    { title: "CRM & Support", icon: UserCheck, href: "/dashboard/crm", key: "crm" },
    { title: "Reports Library", icon: BarChart3, href: "/dashboard/reports", key: "reports" },
    { title: "Notifications", icon: Bell, href: "/dashboard/notifications", key: "notifications" },
    { title: "Administration", icon: ShieldCheck, href: "/dashboard/administration", key: "administration" },
    { title: "Settings", icon: Settings, href: "/dashboard/settings", key: "settings" },
    { title: "Help Manuals", icon: HelpCircle, href: "/dashboard/help", key: "help" },
    { title: "AI Business Assistant", icon: Sparkles, href: "/dashboard/ai-assistant", key: "ai_assistant" },
    { title: "AI Dispatch", icon: Navigation, href: "/dashboard/ai-dispatch", key: "ai_dispatch" },
    { title: "Driver Scorecard", icon: Users, href: "/dashboard/driver-scorecard", key: "driver_scorecard" },
    { title: "Route Calculator", icon: Route, href: "/dashboard/route-calculator", key: "route_calculator" },
    { title: "Profit Center", icon: DollarSign, href: "/dashboard/profit-center", key: "profit_center" },
    { title: "Employee Portal", icon: Users, href: "/dashboard/employee-portal", key: "employee_portal" },
    { title: "Vendor Portal", icon: UserCheck, href: "/dashboard/vendor-portal", key: "vendor_portal" },
    { title: "Workflow Builder", icon: Settings, href: "/dashboard/workflows", key: "workflow_builder" },
    { title: "Integration Hub", icon: Globe, href: "/dashboard/integrations", key: "integration_hub" },
    { title: "ESG & Sustainability", icon: Activity, href: "/dashboard/sustainability", key: "sustainability" },
  ];

  const filteredNavItems = navItems.filter((item) => allowedMenus.includes(item.key));

  return (
    <>
      {/* Mobile Off-Canvas Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-sky-950 via-sky-900 to-slate-950 text-slate-100 transition-all duration-300 ease-in-out flex flex-col shadow-xl border-r border-sky-800/40 shrink-0 h-screen ${
          isOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sky-800/50 shrink-0 bg-sky-950/50">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-sky-500/30 shrink-0">
              AL
            </div>
            {isOpen && (
              <div className="transition-opacity duration-200">
                <span className="font-extrabold text-white text-base tracking-tight block leading-none">
                  ADDies LMS
                </span>
                <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                  Smart Logistics ERP
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {isOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Item List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (item.subItems && pathname.startsWith(item.href));
            const hasSubItems = item.subItems && item.subItems.length > 0 && isOpen;

            return (
              <div key={item.title}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (hasSubItems) {
                      toggleSection(item.title);
                    }
                  }}
                  title={!isOpen ? item.title : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className={`flex items-center gap-3 min-w-0 ${!isOpen ? "mx-auto" : ""}`}>
                    <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-sky-400"}`} />
                    {isOpen && <span className="truncate">{item.title}</span>}
                  </div>

                  {isOpen && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {hasSubItems && (
                        expandedSections[item.title] ? (
                          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                        )
                      )}
                    </div>
                  )}
                </Link>

                {/* Submenu */}
                {hasSubItems && expandedSections[item.title] && (
                  <div className="ml-7 mt-1 space-y-1 border-l border-sky-800/60 pl-3">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="block py-1.5 text-[11px] font-medium text-slate-400 hover:text-sky-300 transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {isOpen ? (
          <div className="p-3 border-t border-sky-900/60 shrink-0">
            <div className="bg-sky-900/30 rounded-xl p-3 border border-sky-800/40 text-[11px]">
              <div className="flex items-center justify-between text-sky-300 font-bold mb-0.5">
                <span>Node.js / tRPC Engine</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                </span>
              </div>
              <p className="text-slate-400 text-[10px]">ALMS Cloud v4.2 • PostgreSQL</p>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-sky-900/60 shrink-0 text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="tRPC Node Server Online" />
          </div>
        )}
      </aside>
    </>
  );
}

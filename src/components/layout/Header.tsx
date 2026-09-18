"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Plus,
  Bell,
  MessageSquare,
  CheckSquare,
  Calendar,
  CloudSun,
  Globe,
  Moon,
  Sun,
  MapPin,
  LogOut,
  User,
  ChevronDown,
  Truck,
  Package,
  FileText,
  ShieldAlert,
  Sparkles,
  Settings,
  Activity,
  DollarSign,
  Users,
  Navigation,
  Route,
  QrCode,
  ReceiptIndianRupee,
  BarChart3,
  Warehouse,
  ShieldCheck,
  AlertTriangle,
  UserCheck
} from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: any;
}

const getQuickActions = (role: string) => {
  const roleActions: Record<string, Array<{label: string, icon: any, href: string}>> = {
    super_admin: [
      { label: "AI Business Assistant", icon: Sparkles, href: "/dashboard/ai-assistant" },
      { label: "Workflow Builder", icon: Settings, href: "/dashboard/workflows" },
      { label: "Integration Hub", icon: Globe, href: "/dashboard/integrations" },
      { label: "Sustainability Dashboard", icon: Activity, href: "/dashboard/sustainability" },
      { label: "New Booking Order", icon: Package, href: "/dashboard/booking" },
    ],
    admin: [
      { label: "AI Business Assistant", icon: Sparkles, href: "/dashboard/ai-assistant" },
      { label: "Workflow Builder", icon: Settings, href: "/dashboard/workflows" },
      { label: "Integration Hub", icon: Globe, href: "/dashboard/integrations" },
      { label: "New Booking Order", icon: Package, href: "/dashboard/booking" },
      { label: "Dispatch Manifest", icon: Truck, href: "/dashboard/dispatch" },
    ],
    executive_management: [
      { label: "AI Business Assistant", icon: Sparkles, href: "/dashboard/ai-assistant" },
      { label: "Company Health Dashboard", icon: Activity, href: "/dashboard" },
      { label: "Sustainability Dashboard", icon: Activity, href: "/dashboard/sustainability" },
      { label: "Profit Center Analytics", icon: DollarSign, href: "/dashboard/profit-center" },
    ],
    regional_manager: [
      { label: "Branch Overview", icon: MapPin, href: "/dashboard/masters" },
      { label: "Fleet Allocation", icon: Truck, href: "/dashboard/fleet" },
      { label: "Reports Library", icon: BarChart3, href: "/dashboard/reports" },
      { label: "Dispatch Manifest", icon: Package, href: "/dashboard/dispatch" },
    ],
    branch_manager: [
      { label: "New Booking Order", icon: Package, href: "/dashboard/booking" },
      { label: "Dispatch Trip Manifest", icon: Truck, href: "/dashboard/dispatch" },
      { label: "Driver Scorecard", icon: Users, href: "/dashboard/driver-scorecard" },
      { label: "Route Cost Calculator", icon: Route, href: "/dashboard/route-calculator" },
    ],
    dispatcher: [
      { label: "New Booking Order", icon: Package, href: "/dashboard/booking" },
      { label: "Dispatch Trip Manifest", icon: Truck, href: "/dashboard/dispatch" },
      { label: "AI Dispatch", icon: Navigation, href: "/dashboard/ai-dispatch" },
      { label: "Route Cost Calculator", icon: Route, href: "/dashboard/route-calculator" },
    ],
    fleet_manager: [
      { label: "Dispatch Trip Manifest", icon: Truck, href: "/dashboard/dispatch" },
      { label: "Log Maintenance Issue", icon: ShieldAlert, href: "/dashboard/fleet" },
      { label: "AI Fleet Health", icon: Activity, href: "/dashboard/fleet" },
      { label: "Route Cost Calculator", icon: Route, href: "/dashboard/route-calculator" },
    ],
    warehouse_manager: [
      { label: "QR Scanner", icon: QrCode, href: "/dashboard/warehouse" },
      { label: "Stock Reports", icon: BarChart3, href: "/dashboard/reports" },
      { label: "Rack Management", icon: Warehouse, href: "/dashboard/warehouse" },
    ],
    security_guard: [
      { label: "Gate Entry/Exit Scan", icon: ShieldCheck, href: "/dashboard/warehouse" },
      { label: "QR Verify", icon: QrCode, href: "/dashboard/warehouse" },
    ],
    driver: [
      { label: "Start Navigation", icon: Navigation, href: "/dashboard/tracking" },
      { label: "Upload POD", icon: FileText, href: "/dashboard/tracking" },
    ],
    customer: [
      { label: "Track Shipment", icon: Navigation, href: "/dashboard/tracking" },
      { label: "Book Shipment", icon: Package, href: "/dashboard/booking" },
    ],
    vendor: [
      { label: "Available Trips", icon: Truck, href: "/dashboard/vendor-portal" },
      { label: "Upload POD", icon: FileText, href: "/dashboard/vendor-portal" },
      { label: "Payment Status", icon: DollarSign, href: "/dashboard/vendor-portal" },
    ],
    accountant: [
      { label: "Profit Calculator", icon: DollarSign, href: "/dashboard/profit-center" },
      { label: "AI Report Generator", icon: Sparkles, href: "/dashboard/reports" },
      { label: "GST & TDS Filing", icon: ReceiptIndianRupee, href: "/dashboard/finance" },
    ],
    hr: [
      { label: "Driver Scorecard", icon: Users, href: "/dashboard/driver-scorecard" },
      { label: "Employee Portal", icon: Users, href: "/dashboard/employee-portal" },
      { label: "Payroll & Attendance", icon: ReceiptIndianRupee, href: "/dashboard/finance" },
    ],
    crm_executive: [
      { label: "New Lead", icon: UserCheck, href: "/dashboard/crm" },
      { label: "Quotation Builder", icon: FileText, href: "/dashboard/crm" },
      { label: "Follow-ups", icon: Calendar, href: "/dashboard/crm" },
    ],
    support_executive: [
      { label: "Open Tickets", icon: AlertTriangle, href: "/dashboard/crm" },
      { label: "Live Customer Chat", icon: MessageSquare, href: "/dashboard/crm" },
    ],
  };
  return roleActions[role] || roleActions.super_admin;
};

export default function Header({ sidebarOpen, onToggleSidebar, user }: HeaderProps) {
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("Delhi National Hub (HQ)");

  const quickActions = getQuickActions(user?.role || "super_admin");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* Left side: Sidebar Toggle & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors shadow-sm"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Global search AWBs, Vehicles, Drivers, Orders..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Middle: Branch Selector (Role based) */}
      <div className="hidden lg:flex items-center gap-2 bg-sky-50/80 border border-sky-100 px-3 py-1.5 rounded-xl text-xs font-medium text-sky-900">
        <MapPin className="w-3.5 h-3.5 text-sky-600" />
        <span>Branch:</span>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="bg-transparent font-semibold text-sky-950 focus:outline-none cursor-pointer"
        >
          <option value="Delhi National Hub (HQ)">DEL-HUB-01 • Delhi National Hub</option>
          <option value="Mumbai Western Port Hub">MUM-HUB-02 • Mumbai Port Hub</option>
          <option value="Bangalore Tech Hub">BLR-HUB-03 • Bangalore Tech Hub</option>
          <option value="All Branches">🌐 All Pan-India Branches</option>
        </select>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Weather optional widget */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-sky-50 border border-amber-100/60 rounded-xl text-xs font-medium text-slate-700">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span>Delhi 28°C Clear</span>
        </div>

        {/* Quick Actions (+) button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-blue-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Quick Action</span>
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50">
                {user?.role?.replace(/_/g, " ") || "Role"} Actions
              </div>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => { setShowQuickActions(false); router.push(action.href); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                  >
                    <Icon className="w-4 h-4 text-sky-600" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks icon */}
        <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hidden sm:block relative" title="Tasks">
          <CheckSquare className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-500 rounded-full" />
        </button>

        {/* Calendar icon */}
        <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hidden md:block" title="Calendar">
          <Calendar className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800">Recent Notifications</span>
                <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">3 Unread</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 bg-amber-50 rounded-lg text-xs">
                  <p className="font-semibold text-amber-900">Harsh Braking Alert</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">DL-01-AB-1234 reported rapid deceleration near Jaipur.</p>
                </div>
                <div className="p-2 bg-sky-50 rounded-lg text-xs">
                  <p className="font-semibold text-sky-900">New Express Booking</p>
                  <p className="text-[11px] text-sky-800 mt-0.5">Reliance Retail scheduled priority pickup.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hidden sm:block"
          title="Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative border-l border-slate-200 pl-3">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || "Aditya Sharma"}
              </p>
              <p className="text-[10px] font-medium text-sky-600 capitalize truncate max-w-[120px]">
                {user?.roleTitle || user?.role?.replace(/_/g, ' ') || "Super Admin"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 rounded-xl mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.name || "Aditya Sharma"}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || "superadmin@alms.com"}</p>
                <span className="mt-1 inline-block px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-bold">
                  Role: {user?.roleTitle || user?.role?.replace(/_/g, ' ')}
                </span>
              </div>

              <button
                onClick={() => { setShowProfileMenu(false); router.push("/"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl"
              >
                <User className="w-4 h-4 text-sky-600" />
                Switch Role / Login Screen
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1 border-t border-slate-100 pt-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

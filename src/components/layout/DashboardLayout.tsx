"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AlertBanner from "../common/AlertBanner";
import { trpc } from "@/lib/trpc";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Use tRPC to query user session
  const { data: sessionData, isLoading } = trpc.auth.getSession.useQuery();

  const user = sessionData?.user || {
    name: "Aditya Sharma",
    email: "superadmin@alms.com",
    role: "super_admin",
    roleTitle: "Super Admin (Founder)",
    department: "Executive"
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] flex text-slate-800 font-sans antialiased overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        userRole={user?.role || "super_admin"}
      />

      {/* Main Right Content Container - min-w-0 flex-1 guarantees no overlap or overflow */}
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarOpen ? "lg:ml-64" : "lg:ml-20"
      }`}>
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AlertBanner />
          {children}
        </main>
      </div>
    </div>
  );
}

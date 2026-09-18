"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { trpc } from "@/lib/trpc";

interface FullWidthLayoutProps {
  children: React.ReactNode;
}

export default function FullWidthLayout({ children }: FullWidthLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { data: sessionData } = trpc.auth.getSession.useQuery();

  const user = sessionData?.user || {
    name: "Aditya Sharma",
    email: "superadmin@alms.com",
    role: "super_admin",
    roleTitle: "Super Admin (Founder)",
    department: "Executive"
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] flex text-slate-800 font-sans antialiased overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        userRole={user?.role || "super_admin"}
      />

      <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarOpen ? "lg:ml-64" : "lg:ml-20"
      }`}>
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        <main className="flex-1 overflow-hidden p-0">
          {children}
        </main>
      </div>
    </div>
  );
}

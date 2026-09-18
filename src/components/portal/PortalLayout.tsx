"use client";

import React from "react";
import Topbar from "./Topbar";
import PortalNavbar from "./PortalNavbar";
import PortalFooter from "./PortalFooter";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f0f8ff] text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Topbar />
      <PortalNavbar />
      <main className="flex-1">{children}</main>
      <PortalFooter />
    </div>
  );
}

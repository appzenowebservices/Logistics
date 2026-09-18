"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BranchesPageClient from "../BranchesPageClient";
import BranchManagersPageClient from "../BranchManagersPageClient";
import PincodeAreasPageClient from "../PincodeAreasPageClient";

type TabType = "branches" | "managers" | "pincodes";

export default function MastersPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>("managers");

  useEffect(() => {
    if (pathname === "/dashboard/masters/branch-managers") {
      setActiveTab("managers");
    } else if (pathname === "/dashboard/masters/pincode-areas") {
      setActiveTab("pincodes");
    } else if (pathname === "/dashboard/masters") {
      setActiveTab("branches");
    }
  }, [pathname]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
                Master Data Management
              </span>
              <h1 className="text-2xl font-black mt-2">Masters Dashboard</h1>
              <p className="text-xs text-sky-100 mt-1">Manage branches, managers, and pincode areas across the organization.</p>
            </div>
          </div>
          
          <div className="flex mt-6 bg-white/10 rounded-2xl p-1.5 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("branches")}
              className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === "branches"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Branches & Hubs
            </button>
            <button
              onClick={() => setActiveTab("managers")}
              className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === "managers"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Branch Managers
            </button>
            <button
              onClick={() => setActiveTab("pincodes")}
              className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeTab === "pincodes"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Pincode Areas
            </button>
          </div>
        </div>

        {activeTab === "branches" && <BranchesPageClient />}
        {activeTab === "managers" && <BranchManagersPageClient />}
        {activeTab === "pincodes" && <PincodeAreasPageClient />}
      </div>
    </DashboardLayout>
  );
}
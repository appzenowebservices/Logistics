"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FleetPageClient from "./FleetPageClient";

export default function FleetPage() {
  return (
    <DashboardLayout>
      <FleetPageClient />
    </DashboardLayout>
  );
}

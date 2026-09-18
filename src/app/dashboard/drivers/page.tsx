"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DriversPageClient from "./DriversPageClient";

export default function DriversPage() {
  return (
    <DashboardLayout>
      <DriversPageClient />
    </DashboardLayout>
  );
}

"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DispatchPageClient from "./DispatchPageClient";

export default function DispatchPage() {
  return (
    <DashboardLayout>
      <DispatchPageClient />
    </DashboardLayout>
  );
}

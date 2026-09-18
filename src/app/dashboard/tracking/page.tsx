"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("@/app/dashboard/tracking/TrackingMap"), { ssr: false });

export default function TrackingPage() {
  return (
    <DashboardLayout>
      <TrackingMap />
    </DashboardLayout>
  );
}

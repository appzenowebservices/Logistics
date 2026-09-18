"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("@/app/tracking/TrackingMap"), { ssr: false });

export default function TrackingRoutePage() {
  return (
    <PortalLayout>
      <div className="py-20 bg-[#f0f8ff] min-h-[70vh]">
        <TrackingMap />
      </div>
    </PortalLayout>
  );
}

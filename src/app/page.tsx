"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import Hero3DSection from "@/components/portal/Hero3DSection";
import TrackingWidget from "@/components/portal/TrackingWidget";
import ServicesGrid from "@/components/portal/ServicesGrid";
import FleetShowcase from "@/components/portal/FleetShowcase";
import NetworkStats from "@/components/portal/NetworkStats";
import ClientsSection from "@/components/portal/ClientsSection";

export default function HomePage() {
  return (
    <PortalLayout>
      <Hero3DSection />
      <TrackingWidget />
      <ServicesGrid />
      <NetworkStats />
      <FleetShowcase />
      <ClientsSection />
    </PortalLayout>
  );
}

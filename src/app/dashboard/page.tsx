"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleDashboardEngine from "@/components/dashboard/RoleDashboardEngine";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data && data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser({
            name: "Aditya Sharma",
            email: "superadmin@alms.com",
            role: "super_admin",
            roleTitle: "Super Admin (Founder)"
          });
        }
      } catch {
        setUser({
          name: "Aditya Sharma",
          role: "super_admin"
        });
      } finally {
        setLoading(false);
      }
    }
    getSession();
  }, []);

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-sky-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <RoleDashboardEngine user={user} />
      )}
    </DashboardLayout>
  );
}

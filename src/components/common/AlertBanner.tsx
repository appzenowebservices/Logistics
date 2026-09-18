"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X, Bell } from "lucide-react";

interface AlertBannerProps {
  initialMessage?: string;
}

export default function AlertBanner({ initialMessage }: AlertBannerProps) {
  const [alerts, setAlerts] = useState<Array<{ id: number; type: 'alert' | 'success' | 'info'; title: string; message: string }>>([
    {
      id: 1,
      type: 'alert',
      title: 'GPS Harsh Braking Alert',
      message: 'Vehicle DL-01-AB-1234 reported harsh braking on NH-8 near Jaipur corridor.'
    },
    {
      id: 2,
      type: 'info',
      title: 'FASTag Balance Advisory',
      message: 'Fleet Account FASTag balance is approaching the ₹5,000 threshold reload limit.'
    }
  ]);

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start justify-between p-4 rounded-xl border shadow-sm transition-all animate-in fade-in ${
            alert.type === 'alert'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {alert.type === 'alert' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {alert.type === 'info' && <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />}
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/60">
                  Live Alert
                </span>
                {alert.title}
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={() => removeAlert(alert.id)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors"
            title="Dismiss alert"
          >
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      ))}
    </div>
  );
}

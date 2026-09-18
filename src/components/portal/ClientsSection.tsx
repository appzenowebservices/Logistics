"use client";

import React from "react";
import { Star, Building2, CheckCircle2 } from "lucide-react";

export default function ClientsSection() {
  const clients = [
    {
      company: "Reliance Retail Pvt Ltd",
      role: "Vice President Logistics",
      quote: "Switching our 40ft container dispatch over to ALMS gave us 100% visibility into highway harsh braking and cut our warehouse gate wait time by 45 mins.",
      rating: 5,
    },
    {
      company: "Flipkart Supply Chain",
      role: "National Hub Lead",
      quote: "The Node.js tRPC API reliability is unmatched. Our automated rate calculations and E-Way bill reconciliations happen in milliseconds.",
      rating: 5,
    },
    {
      company: "Tata Motors Express",
      role: "Fleet Procurement Director",
      quote: "The 16 Role-Based access control ensures our drivers, warehouse guards, and accounts team work in harmony without data overlap or security gaps.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-[#f0f8ff] px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
            Trusted Enterprise Partners
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Powering India's Leading Supply Chains
          </h2>
          <p className="text-sm text-slate-600">
            Over 150 corporate clients rely on ADDies Logistics Management System (ALMS) daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {clients.map((c) => (
            <div key={c.company} className="bg-white p-8 rounded-3xl border border-sky-100 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(c.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                  "{c.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 font-black flex items-center justify-center text-xs">
                  {c.company.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    {c.company} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h4>
                  <p className="text-[10px] text-slate-500">{c.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

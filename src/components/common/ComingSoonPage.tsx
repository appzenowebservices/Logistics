"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function ComingSoonPage({ title, description, icon }: ComingSoonPageProps) {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
            Coming Soon
          </span>
          <h1 className="text-2xl font-black mt-2">{title}</h1>
          <p className="text-xs text-sky-100 mt-1">{description}</p>
        </div>
        {icon || <Sparkles className="w-12 h-12 text-white/80" />}
      </div>

      <div className="bg-white rounded-2xl p-8 border border-sky-100 shadow-sm text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Module Under Development</h3>
          <p className="text-xs text-slate-500">
            This feature is being built as part of the ADDies Logistics Cloud Ecosystem upgrade. 
            It will be available in the next release with full AI-assisted operations, predictive insights, and role-based workflows.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

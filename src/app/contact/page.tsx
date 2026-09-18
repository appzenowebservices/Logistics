"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactRoutePage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PortalLayout>
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f0f8ff]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase">
              Get in Touch
            </span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Contact National Dispatch HQ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Reach out for corporate freight rate agreements, IoT hardware installations, or 24/7 emergency dispatch support.
            </p>

            <div className="space-y-4 pt-4 text-xs">
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
                <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Delhi National Hub (HQ)</p>
                  <p className="text-slate-500">NH-8 Mahipalpur Logistics Park, New Delhi - 110037</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">24/7 Helpline & Control Room</p>
                  <p className="text-slate-500">1800-ADD-LOGIS / +91-11-23456789</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
                <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Official Inquiries</p>
                  <p className="text-slate-500">support@alms.com / corporate@alms.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-sky-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">Send Operational Ticket / Inquiry</h3>
            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-center space-y-2 font-bold text-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p>Inquiry received successfully! Our Chief Dispatcher will contact you within 15 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input type="text" required placeholder="Aditya Sharma" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Corporate Email</label>
                    <input type="email" required placeholder="aditya@company.com" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inquiry Subject</label>
                  <select className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold">
                    <option>Corporate Freight Rate Agreement</option>
                    <option>Fleet IoT Hardware Integration</option>
                    <option>RBAC Portal Access Issue</option>
                    <option>General Support Request</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message Details</label>
                  <textarea rows={4} required placeholder="Describe your transport volume or operational requirement..." className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold" />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

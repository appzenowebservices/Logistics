"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { IconLinkedin, IconTwitter, IconFacebook, IconInstagram, IconYoutube } from "./SocialIcons";

export default function PortalFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 text-slate-300 pt-16 pb-12 border-t border-sky-900/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-sky-800/40">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                AL
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block leading-none">
                  ADDies LMS
                </span>
                <span className="text-[10px] font-bold text-sky-400 tracking-widest uppercase">
                  Smart Logistics • Smart Business
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Flagship Enterprise Logistics Ecosystem combining 16 specialized Role-Based Portals, Live CAN Bus/OBD IoT Telemetry, Barcode Warehouse Management, and AI Demand Forecasting.
            </p>

            {/* Social Links in Footer as explicitly requested */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Connect on Social Networks:
              </p>
              <div className="flex items-center gap-2.5">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-all text-slate-300 shadow-sm">
                  <IconLinkedin className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter/X" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-sky-400 hover:text-white flex items-center justify-center transition-all text-slate-300 shadow-sm">
                  <IconTwitter className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all text-slate-300 shadow-sm">
                  <IconFacebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all text-slate-300 shadow-sm">
                  <IconInstagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all text-slate-300 shadow-sm">
                  <IconYoutube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-sky-500 pl-2">
              Public Portal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-sky-400 transition-colors">Home • 3D Showcase</Link></li>
              <li><Link href="/services" className="hover:text-sky-400 transition-colors">25+ ERP Modules</Link></li>
              <li><Link href="/fleet-showcase" className="hover:text-sky-400 transition-colors">Fleet & IoT Hardware</Link></li>
              <li><Link href="/tracking" className="hover:text-sky-400 transition-colors">Live AWB Tracking</Link></li>
              <li><Link href="/about" className="hover:text-sky-400 transition-colors">Company Setup & Leadership</Link></li>
              <li><Link href="/contact" className="hover:text-sky-400 transition-colors">Pan-India Branch Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Role Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Role Access (RBAC)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors font-semibold text-white">🔐 Role ERP Login Screen</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors">Super Admin & CXO Portal</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors">Dispatcher & Fleet Manager</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors">Warehouse & Barcode Scanner</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors">Driver Android App (PWA)</Link></li>
              <li><Link href="/login" className="hover:text-sky-400 transition-colors">Corporate Client Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Hubs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Logistics Dispatch News
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe for freight tariff updates, FASTag regulatory notices, and AI logistics whitepapers.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="enter corporate email..."
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Subscribe Now
                </button>
              </form>
            )}

            <div className="mt-4 pt-4 border-t border-sky-900/50 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" /> HQ: NH-8 Logistics Park, Delhi
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> +91-11-23456789
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ADDies Logistics Management System (ALMS). Built with Node.js & tRPC.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/services" className="hover:text-slate-300 transition-colors">Terms of Dispatch</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Security & ISO 27001</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React from "react";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { IconLinkedin, IconTwitter, IconFacebook, IconInstagram, IconYoutube } from "./SocialIcons";

export default function Topbar() {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-sky-800/40 font-medium">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Contact Info */}
        <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
          <a href="tel:+911800233564" className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span>24/7 Helpline: 1800-ADD-LOGIS</span>
          </a>
          <a href="mailto:contact@alms.com" className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>support@alms.com</span>
          </a>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pan-India Hubs: Open 24x365 Days</span>
          </span>
        </div>

        {/* Right: Social Links & Quick Track */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 border-r border-slate-700 pr-4">
            <span className="text-[11px] text-slate-400 hidden lg:inline">Connect with ALMS:</span>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-1 rounded hover:bg-sky-500 hover:text-white transition-all text-slate-400">
              <IconLinkedin className="w-3.5 h-3.5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter/X" className="p-1 rounded hover:bg-sky-400 hover:text-white transition-all text-slate-400">
              <IconTwitter className="w-3.5 h-3.5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-1 rounded hover:bg-blue-600 hover:text-white transition-all text-slate-400">
              <IconFacebook className="w-3.5 h-3.5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="p-1 rounded hover:bg-pink-600 hover:text-white transition-all text-slate-400">
              <IconInstagram className="w-3.5 h-3.5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="p-1 rounded hover:bg-rose-600 hover:text-white transition-all text-slate-400">
              <IconYoutube className="w-3.5 h-3.5" />
            </a>
          </div>

          <Link href="/tracking" className="flex items-center gap-1 text-sky-300 hover:text-white font-bold transition-colors">
            <MapPin className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Track AWB</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

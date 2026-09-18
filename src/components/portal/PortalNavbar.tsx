"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Lock, Menu, X, ArrowRight, Truck } from "lucide-react";

export default function PortalNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "25+ ERP Modules", href: "/services" },
    { name: "Fleet & IoT Hardware", href: "/fleet-showcase" },
    { name: "Live Shipment Track", href: "/tracking" },
    { name: "About ALMS", href: "/about" },
    { name: "Contact & Hubs", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-600/30 group-hover:scale-105 transition-transform">
            AL
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight block leading-none">
              ADDies LMS
            </span>
            <span className="text-[10px] font-bold text-sky-600 tracking-widest uppercase flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Smart Logistics ERP
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-bold transition-all relative py-2 ${
                  isActive ? "text-sky-600" : "text-slate-600 hover:text-sky-600"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full animate-in fade-in" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/tracking"
            className="px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 font-bold text-xs hover:bg-sky-100 transition-colors flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-sky-600" /> Track Shipment
          </Link>

          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Lock className="w-3.5 h-3.5" /> Role ERP Login
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sky-100 py-4 px-2 space-y-3 bg-white animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                pathname === link.href ? "bg-sky-50 text-sky-600" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 px-2">
            <Link
              href="/tracking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-sky-50 text-sky-800 font-bold text-xs text-center flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4 text-sky-600" /> Track Consignment
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-md"
            >
              <Lock className="w-4 h-4" /> Role-Based ERP Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

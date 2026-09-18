"use client";

import React from "react";
import PortalLayout from "@/components/portal/PortalLayout";
import { Check, X, Zap, Building2, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    priceMonthly: 2499,
    priceYearly: 24999,
    code: "starter",
    description: "Suitable for small transport companies.",
    limits: { users: 15, branches: 2, warehouses: 0, vehicles: 25, drivers: 25, bookingsPerMonth: 500 },
    modules: [
      "Dashboard", "RBAC", "Fleet Management", "Driver Management",
      "Customer Management", "Vendor Management", "Booking", "Trip Management",
      "Dispatch", "Basic GPS Tracking (OpenStreetMap)", "Employee Management",
      "Attendance", "Leave Management", "Reports", "PWA"
    ],
    integrations: ["OpenStreetMap", "Razorpay IFSC Validation", "Email Notifications"],
    support: "Email Support, Documentation, Knowledge Base",
    highlighted: false,
    cta: "Start Free Trial"
  },
  {
    name: "Professional",
    priceMonthly: 7999,
    priceYearly: 79999,
    code: "professional",
    description: "Suitable for growing logistics companies.",
    limits: { users: 75, branches: 5, warehouses: 0, vehicles: 150, drivers: 150, bookingsPerMonth: 5000 },
    modules: [
      "Everything in Starter, plus:",
      "Warehouse Management", "Inventory", "Barcode & QR Scanning",
      "Payroll & Salary Processing", "PF / ESI / TDS", "Shift Management",
      "Overtime & Performance Appraisal", "Asset Management", "CRM",
      "Customer Portal", "Vendor Portal", "Regional Manager Dashboard",
      "Branch Manager Dashboard", "Advanced Reports & Analytics",
      "GPS Replay & Geofencing", "Driver Mobile PWA"
    ],
    integrations: ["OpenStreetMap", "Razorpay IFSC Validation", "Email Notifications"],
    support: "Email, Chat, Priority Support",
    highlighted: true,
    cta: "Start Free Trial"
  },
  {
    name: "Business",
    priceMonthly: 19999,
    priceYearly: 199999,
    code: "business",
    description: "Designed for multi-branch logistics companies.",
    limits: { users: 300, branches: 20, warehouses: 10, vehicles: 500, drivers: 500, bookingsPerMonth: -1 },
    modules: [
      "Everything in Professional, plus:",
      "Multi-Warehouse & Multi-State Operations", "Finance Module",
      "Billing, GST & Freight Bills", "Approval Workflows", "API Access & Webhooks",
      "Role Builder & Custom Reports", "Audit Logs", "Driver Incentives",
      "Vendor Settlements", "SLA Monitoring"
    ],
    integrations: ["OpenStreetMap", "Razorpay IFSC Validation", "Email Notifications", "SMS Gateway (optional)", "WhatsApp Business API (optional)"],
    support: "Dedicated Account Manager, Chat, Phone, Remote Assistance",
    highlighted: false,
    cta: "Contact Sales"
  },
  {
    name: "Enterprise",
    priceMonthly: 0,
    priceYearly: 0,
    code: "enterprise",
    description: "Designed for companies with 500+ vehicles.",
    limits: { users: -1, branches: -1, warehouses: -1, vehicles: -1, drivers: -1, bookingsPerMonth: -1 },
    modules: [
      "Unlimited Everything",
      "White Label", "Dedicated Cloud", "Custom Branding & Domain",
      "Custom Integrations", "IoT Support & GPS Device Integration",
      "SSO & LDAP/Active Directory", "Disaster Recovery & High Availability",
      "Dedicated Database", "On-Premise Option", "Premium SLA",
      "Implementation Support", "Custom Development"
    ],
    integrations: ["All available integrations"],
    support: "24/7 Premium Support, Dedicated TAM",
    highlighted: false,
    cta: "Contact Sales"
  }
];

const addOns = [
  { name: "HRMS Pro", price: 1999 },
  { name: "Payroll", price: 1999 },
  { name: "Finance", price: 2999 },
  { name: "Warehouse", price: 2999 },
  { name: "CRM", price: 2499 },
  { name: "Customer Portal", price: 999 },
  { name: "Vendor Portal", price: 999 },
  { name: "Driver App (Advanced)", price: 999 },
  { name: "API Access", price: 1999 },
  { name: "White Label", price: 4999 },
  { name: "Website Builder", price: 1999 },
  { name: "SEO Toolkit", price: 999 },
  { name: "Digital Marketing Dashboard", price: 1499 },
];

export default function PricingPage() {
  return (
    <PortalLayout>
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f0f8ff]">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase">
              Simple, Usage-Based Pricing
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
              Choose Your Plan
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Usage-based subscription plans where limits increase with your fleet size. Start with a 7-day free trial. No credit card required.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-500 pt-2">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 7-Day Free Trial</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> No Setup Fees</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Cancel Anytime</span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.code}
                className={`relative bg-white rounded-3xl border-2 p-6 flex flex-col ${
                  plan.highlighted
                    ? "border-sky-500 shadow-2xl shadow-sky-500/20 scale-[1.02]"
                    : "border-slate-200 shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black uppercase rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    {plan.code === "enterprise" ? (
                      <div className="text-3xl font-black text-slate-900">Custom</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">₹{plan.priceMonthly.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 font-semibold">/month</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold">
                          or ₹{plan.priceYearly.toLocaleString()}/year
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-sky-500" />
                      <span>{plan.limits.users === -1 ? "Unlimited" : plan.limits.users} Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-sky-500" />
                      <span>{plan.limits.branches === -1 ? "Unlimited" : plan.limits.branches} Branches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-sky-500" />
                      <span>{plan.limits.vehicles === -1 ? "Unlimited" : plan.limits.vehicles} Vehicles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-sky-500" />
                      <span>{plan.limits.drivers === -1 ? "Unlimited" : plan.limits.drivers} Drivers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {plan.limits.bookingsPerMonth === -1 ? "Unlimited" : plan.limits.bookingsPerMonth + " bookings/month"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Key Modules</p>
                    <ul className="space-y-1.5">
                      {plan.modules.map((mod, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                          {mod.startsWith("Everything") ? (
                            <span className="text-slate-400 font-bold">{mod}</span>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{mod}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Support</p>
                    <p className="text-[11px] text-slate-600">{plan.support}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={plan.code === "enterprise" ? "/contact" : "/login"}
                    className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Add-On Modules */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Optional Add-On Modules</h2>
              <p className="text-sm text-slate-600">Extend any plan with standalone modules. Billed monthly.</p>
            </div>
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider">Module</th>
                      <th className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider text-right">Monthly</th>
                      <th className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider text-center">Included In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {addOns.map((addon) => (
                      <tr key={addon.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-slate-900">{addon.name}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-900">₹{addon.price.toLocaleString()}</td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                            <Zap className="w-3 h-3" /> Any Plan
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Feature Matrix */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Feature Matrix</h2>
              <p className="text-sm text-slate-600">Module availability across plans.</p>
            </div>
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider">Module</th>
                      <th className="px-4 py-4 font-black text-sky-700 uppercase tracking-wider text-center">Starter</th>
                      <th className="px-4 py-4 font-black text-sky-700 uppercase tracking-wider text-center">Professional</th>
                      <th className="px-4 py-4 font-black text-sky-700 uppercase tracking-wider text-center">Business</th>
                      <th className="px-4 py-4 font-black text-sky-700 uppercase tracking-wider text-center">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Fleet Management", true, true, true, true],
                      ["Driver Management", true, true, true, true],
                      ["Booking & Dispatch", true, true, true, true],
                      ["GPS (OpenStreetMap)", true, true, true, true],
                      ["HRMS Core", false, true, true, true],
                      ["Payroll", false, true, true, true],
                      ["Warehouse", false, true, true, true],
                      ["Finance", false, false, true, true],
                      ["CRM", false, true, true, true],
                      ["Website Builder", false, "Optional", true, true],
                      ["White Label", false, false, "Optional", true],
                      ["API Access", false, "Optional", true, true],
                      ["IoT Integration", false, false, "Optional", true],
                    ].map(([mod, starter, prof, biz, ent]) => (
                      <tr key={mod as string} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-slate-900">{mod as string}</td>
                        <td className="px-4 py-3.5 text-center">{starter === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : starter === false ? <X className="w-4 h-4 text-slate-300 mx-auto" /> : <span className="text-[10px] font-bold text-amber-600">{starter as string}</span>}</td>
                        <td className="px-4 py-3.5 text-center">{prof === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : prof === false ? <X className="w-4 h-4 text-slate-300 mx-auto" /> : <span className="text-[10px] font-bold text-amber-600">{prof as string}</span>}</td>
                        <td className="px-4 py-3.5 text-center">{biz === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : biz === false ? <X className="w-4 h-4 text-slate-300 mx-auto" /> : <span className="text-[10px] font-bold text-amber-600">{biz as string}</span>}</td>
                        <td className="px-4 py-3.5 text-center">{ent === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : ent === false ? <X className="w-4 h-4 text-slate-300 mx-auto" /> : <span className="text-[10px] font-bold text-amber-600">{ent as string}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-black">Ready to Transform Your Logistics?</h2>
            <p className="text-sky-100 text-sm max-w-xl mx-auto">
              Join India's fastest-growing logistics SaaS platform. Start your 7-day free trial today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/login" className="px-8 py-3.5 bg-white text-sky-700 rounded-xl text-sm font-black hover:bg-sky-50 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/contact" className="px-8 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-black hover:bg-white/20 transition-colors">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

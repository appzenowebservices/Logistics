"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Package,
  Calculator,
  Truck,
  CheckCircle2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Printer,
  User,
} from "lucide-react";

type BookingFormData = {
  id?: string;
  origin: string;
  destination: string;
  weight: string;
  value: string;
  status: string;
  customerId?: string;
  customerName?: string;
};

type Booking = {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  weight?: string;
  value?: string;
  status: string;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type SidebarMode = "form" | "view" | "edit" | null;

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    origin: "",
    destination: "",
    weight: "",
    value: "",
    status: "booked",
    customerName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRateCalc, setShowRateCalc] = useState(false);
  const [fragile, setFragile] = useState(false);
  const [tempControl, setTempControl] = useState(false);

  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.getSession.useQuery();
  const user = sessionData?.user;

  const listQuery = trpc.bookings.list.useQuery();
  const searchQueryResults = trpc.bookings.search.useQuery(
    { startDate: dateFrom || undefined, endDate: dateTo || undefined, customerName: customerSearch || undefined },
    { enabled: !!(dateFrom || dateTo || customerSearch) }
  );
  const createMutation = trpc.bookings.create.useMutation();
  const updateMutation = trpc.bookings.update.useMutation();
  const deleteMutation = trpc.bookings.delete.useMutation();

  useEffect(() => {
    if (listQuery.data) {
      setBookings(listQuery.data as Booking[]);
    }
  }, [listQuery.data]);

  const displayedBookings = customerSearch || dateFrom || dateTo
    ? (searchQueryResults.data as Booking[] || [])
    : bookings;

  const filteredBookings = displayedBookings.filter(
    (b) =>
      !searchQuery ||
      b.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setSelectedBooking(null);
    setFormData({ origin: "", destination: "", weight: "", value: "", status: "booked", customerName: "" });
    setShowRateCalc(false);
    setSidebarMode("form");
  };

  const openEditForm = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({
      id: booking.id,
      origin: booking.origin,
      destination: booking.destination,
      weight: booking.weight || "",
      value: booking.value || "",
      status: booking.status,
      customerId: booking.customerId,
      customerName: "",
    });
    setSidebarMode("edit");
  };

  const openViewSidebar = async (booking: Booking) => {
    setSelectedBooking(booking);
    setSidebarMode("view");
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedBooking(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sidebarMode === "edit" && selectedBooking) {
        await updateMutation.mutateAsync({
          id: selectedBooking.id,
          origin: formData.origin,
          destination: formData.destination,
          weight: formData.weight,
          value: formData.value,
          status: formData.status,
        });
        await utils.bookings.list.invalidate();
        if (dateFrom || dateTo || customerSearch) {
          await searchQueryResults.refetch();
        }
        closeSidebar();
      } else {
        const res = await createMutation.mutateAsync({
          origin: formData.origin,
          destination: formData.destination,
          weight: formData.weight,
          vehicleType: "Container (40ft)",
          fragile,
          temperatureControl: tempControl,
          estimatedValue: formData.value,
        });
        if (res.success) {
          await utils.bookings.list.invalidate();
          closeSidebar();
        }
      }
    } catch (error) {
      console.error("Error saving booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to delete booking ${booking.trackingNumber}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: booking.id });
      await utils.bookings.list.invalidate();
      if (dateFrom || dateTo || customerSearch) {
        await searchQueryResults.refetch();
      }
      if (selectedBooking?.id === booking.id) {
        closeSidebar();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const handleSearch = () => {
    searchQueryResults.refetch();
  };

  const printBarcodeLabel = (booking: Booking) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Barcode Label - ${booking.trackingNumber}</title>
<style>
  @page { size: 80mm 50mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; padding: 8mm; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
  .header h1 { font-size: 14pt; font-weight: bold; }
  .header p { font-size: 8pt; }
  .awb { text-align: center; font-size: 22pt; font-weight: bold; letter-spacing: 4px; border: 2px solid #000; padding: 6px; margin: 6px 0; }
  .route { display: flex; justify-content: space-between; font-size: 12pt; font-weight: bold; margin: 6px 0; }
  .route .arrow { font-size: 14pt; }
  .details { display: flex; justify-content: space-between; font-size: 9pt; margin-top: 6px; border-top: 1px dashed #000; padding-top: 4px; }
  .footer { text-align: center; font-size: 7pt; margin-top: 4px; }
  @media print { body { padding: 5mm; } }
</style>
</head>
<body>
  <div class="header">
    <h1>ADDies LOGISTICS</h1>
    <p>ADDies Logistics Management System (ALMS)</p>
  </div>
  <div class="awb">${booking.trackingNumber}</div>
  <div class="route">
    <span>${booking.origin}</span>
    <span class="arrow">➜</span>
    <span>${booking.destination}</span>
  </div>
  <div class="details">
    <span>Weight: ${booking.weight || "N/A"} Tons</span>
    <span>Value: INR ${Number(booking.value || 0).toLocaleString()}</span>
  </div>
  <div class="details">
    <span>Status: ${booking.status.toUpperCase()}</span>
    <span>${new Date(booking.createdAt).toLocaleDateString("en-IN")}</span>
  </div>
  <div class="footer">
    www.addieslogistics.com | support@alms.com
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      booked: "bg-sky-100 text-sky-800 border-sky-200",
      in_transit: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
      dispatched: "bg-amber-100 text-amber-800 border-amber-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusConfig[status] || "bg-slate-100 text-slate-800 border-slate-200"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const stats = [
    { label: "Total Bookings", value: bookings.length, color: "text-slate-900" },
    { label: "Booked", value: bookings.filter((b) => b.status === "booked").length, color: "text-sky-600" },
    { label: "In Transit", value: bookings.filter((b) => b.status === "in_transit").length, color: "text-purple-600" },
    { label: "Delivered", value: bookings.filter((b) => b.status === "delivered").length, color: "text-emerald-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-sky-800 to-blue-900 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
              Module 14 • Booking & Quotation
            </span>
            <h1 className="text-2xl font-black mt-2">Shipment Booking & AWB Management</h1>
            <p className="text-xs text-sky-100 mt-1">Generate bookings, manage AWBs, rate calculator, and barcode labels.</p>
          </div>
          <button
            onClick={openCreateForm}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add New Booking
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              <h3 className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Bookings Roster ({filteredBookings.length} shown)</h3>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by AWB, origin, destination..."
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="font-semibold text-slate-600">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <label className="font-semibold text-slate-600">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="relative flex-1 w-full md:w-auto">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by customer name..."
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            {(dateFrom || dateTo || customerSearch) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setCustomerSearch(""); }}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="pb-3">AWB Number</th>
                  <th className="pb-3">Origin</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Weight</th>
                  <th className="pb-3">Value</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} onClick={() => openViewSidebar(booking)} className="hover:bg-sky-50/40 transition-colors cursor-pointer">
                    <td className="py-3.5 font-mono font-bold text-sky-600">{booking.trackingNumber}</td>
                    <td className="py-3.5 font-medium">{booking.origin}</td>
                    <td className="py-3.5 font-medium">{booking.destination}</td>
                    <td className="py-3.5">{booking.weight} Tons</td>
                    <td className="py-3.5">INR {Number(booking.value).toLocaleString()}</td>
                    <td className="py-3.5">{getStatusBadge(booking.status)}</td>
                    <td className="py-3.5 font-medium text-[10px]">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); printBarcodeLabel(booking); }}
                          className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                          title="Print Barcode Label"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditForm(booking); }}
                          className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(booking); }}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-xs text-slate-500">No bookings found matching your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(sidebarMode === "form" || sidebarMode === "edit") && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                <h2 className="font-black text-base text-slate-900">
                  {sidebarMode === "form" ? "New Booking" : "Edit Booking"}
                </h2>
                <button onClick={closeSidebar} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
                    <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wide flex items-center gap-2">
                      <Package className="w-4 h-4" /> Consignment Details
                    </h4>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">Origin <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="New Delhi (DEL-HUB-01)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">Destination <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="Mumbai (MUM-HUB-02)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">Weight (Tons)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">Value (INR)</label>
                        <input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                    {sidebarMode === "form" && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="booked">Booked</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {sidebarMode === "form" && (
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
                      <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Special Handling
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700">
                          <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="w-4 h-4 rounded text-sky-600" />
                          Fragile (+ INR 4,500)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-700">
                          <input type="checkbox" checked={tempControl} onChange={(e) => setTempControl(e.target.checked)} className="w-4 h-4 rounded text-sky-600" />
                          Temperature Control (+ INR 8,000)
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          let base = parseFloat(formData.weight || "10") * 3200;
                          if (fragile) base += 4500;
                          if (tempControl) base += 8000;
                          setFormData({ ...formData, value: String(Math.round(base)) });
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
                      >
                        <Calculator className="w-4 h-4" /> Auto-Calculate Rate
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting ? "Saving..." : sidebarMode === "edit" ? "Update Booking" : "Create Booking"}
                    </button>
                    <button type="button" onClick={closeSidebar} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {sidebarMode === "view" && selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                <h2 className="font-black text-base text-slate-900">Booking Details</h2>
                <button onClick={closeSidebar} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-lg font-mono">{selectedBooking.trackingNumber}</h3>
                      <p className="text-xs text-sky-100">{selectedBooking.origin} ➔ {selectedBooking.destination}</p>
                    </div>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-sm text-slate-900">Shipment Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Origin</p>
                      <p className="font-semibold text-slate-800 mt-1">{selectedBooking.origin}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Destination</p>
                      <p className="font-semibold text-slate-800 mt-1">{selectedBooking.destination}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                      <p className="font-semibold text-slate-800 mt-1">{selectedBooking.weight || "N/A"} Tons</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Value</p>
                      <p className="font-semibold text-slate-800 mt-1">INR {Number(selectedBooking.value || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <p className="mt-1">{getStatusBadge(selectedBooking.status)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Created At</p>
                      <p className="font-semibold text-slate-800 mt-1">{new Date(selectedBooking.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => printBarcodeLabel(selectedBooking)}
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print Barcode Label
                  </button>
                  <button
                    onClick={() => openEditForm(selectedBooking)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Booking
                  </button>
                  <button
                    onClick={() => { closeSidebar(); handleDelete(selectedBooking); }}
                    className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

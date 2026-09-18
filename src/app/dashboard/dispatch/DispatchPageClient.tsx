"use client";

import React, { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  Navigation,
  Truck,
  FileText,
  CheckCircle2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  MapPin,
  Calendar,
  Users,
  Package,
  Eye,
} from "lucide-react";

type ManifestFormData = {
  manifestNumber: string;
  tripNumber: string;
  vehicleId: string;
  driverId: string;
  branchId: string;
  origin: string;
  destination: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string;
};

type Manifest = {
  id: string;
  manifestNumber: string;
  tripNumber: string;
  vehicleId: string;
  driverId: string;
  branchId: string;
  origin: string;
  destination: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: string;
  shipmentIds: string[];
  totalWeight: string;
  totalValue: string;
  notes?: string;
  createdAt: Date;
};

type SidebarMode = "form" | "view" | "edit" | null;

export default function DispatchPageClient() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);
  const [formData, setFormData] = useState<ManifestFormData>({
    manifestNumber: "",
    tripNumber: "",
    vehicleId: "",
    driverId: "",
    branchId: "",
    origin: "",
    destination: "",
    scheduledStart: "",
    scheduledEnd: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  const listQuery = trpc.manifests.list.useQuery();
  const createMutation = trpc.manifests.create.useMutation();
  const updateMutation = trpc.manifests.update.useMutation();
  const deleteMutation = trpc.manifests.delete.useMutation();

  const vehiclesQuery = trpc.fleet.list.useQuery();
  const driversQuery = trpc.drivers.list.useQuery();
  const branchesQuery = trpc.branches.list.useQuery();

  useEffect(() => {
    if (listQuery.data) {
      setManifests(listQuery.data as Manifest[]);
    }
  }, [listQuery.data]);

  const vehicleMap = useMemo(() => {
    const map: Record<string, string> = {};
    (vehiclesQuery.data || []).forEach((v: any) => {
      const vid = v.id || v._id;
      map[vid] = v.registrationNumber;
    });
    return map;
  }, [vehiclesQuery.data]);

  const driverMap = useMemo(() => {
    const map: Record<string, string> = {};
    (driversQuery.data || []).forEach((d: any) => {
      const did = d.id || d._id;
      map[did] = d.name;
    });
    return map;
  }, [driversQuery.data]);

  const branchMap = useMemo(() => {
    const map: Record<string, string> = {};
    (branchesQuery.data || []).forEach((b: any) => {
      const bid = b.id || b._id;
      map[bid] = b.name;
    });
    return map;
  }, [branchesQuery.data]);

  const filteredManifests = manifests.filter((m) => {
    const matchesQuery =
      !searchQuery ||
      m.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tripNumber.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(m.scheduledStart) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(m.scheduledStart) <= new Date(dateTo + "T23:59:59");
    }

    return matchesQuery && matchesDate;
  });

  const openCreateForm = () => {
    setSelectedManifest(null);
    setFormData({
      manifestNumber: "",
      tripNumber: "",
      vehicleId: "",
      driverId: "",
      branchId: "",
      origin: "",
      destination: "",
      scheduledStart: "",
      scheduledEnd: "",
      notes: "",
    });
    setSidebarMode("form");
  };

  const openEditForm = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    setFormData({
      manifestNumber: manifest.manifestNumber,
      tripNumber: manifest.tripNumber,
      vehicleId: manifest.vehicleId,
      driverId: manifest.driverId,
      branchId: manifest.branchId,
      origin: manifest.origin,
      destination: manifest.destination,
      scheduledStart: manifest.scheduledStart ? new Date(manifest.scheduledStart).toISOString().split("T")[0] : "",
      scheduledEnd: manifest.scheduledEnd ? new Date(manifest.scheduledEnd).toISOString().split("T")[0] : "",
      notes: manifest.notes || "",
    });
    setSidebarMode("edit");
  };

  const openViewSidebar = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    setSidebarMode("view");
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedManifest(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sidebarMode === "edit" && selectedManifest) {
        await updateMutation.mutateAsync({
          id: selectedManifest.id,
          ...formData,
        });
        await utils.manifests.list.invalidate();
        closeSidebar();
      } else {
        await createMutation.mutateAsync(formData);
        await utils.manifests.list.invalidate();
        closeSidebar();
      }
    } catch (error) {
      console.error("Error saving manifest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (manifest: Manifest) => {
    if (!confirm(`Are you sure you want to delete manifest ${manifest.manifestNumber}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: manifest.id });
      await utils.manifests.list.invalidate();
      if (selectedManifest?.id === manifest.id) {
        closeSidebar();
      }
    } catch (error) {
      console.error("Error deleting manifest:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      planned: "bg-amber-100 text-amber-800 border-amber-200",
      dispatched: "bg-sky-100 text-sky-800 border-sky-200",
      in_transit: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusConfig[status] || "bg-slate-100 text-slate-800 border-slate-200"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const renderManifestForm = (mode: "form" | "edit") => (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
        <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4" /> Manifest Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Manifest Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.manifestNumber}
                onChange={(e) => setFormData({ ...formData, manifestNumber: e.target.value })}
                placeholder="MF-2026-001"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Trip Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.tripNumber}
                onChange={(e) => setFormData({ ...formData, tripNumber: e.target.value })}
                placeholder="TRP-001"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
        <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Route & Schedule
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Origin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder="Delhi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="Mumbai"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Scheduled Start <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={formData.scheduledStart}
                onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Scheduled End <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={formData.scheduledEnd}
                onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
        <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide flex items-center gap-2">
          <Truck className="w-4 h-4" /> Vehicle & Driver Assignment
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Vehicle <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Truck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select
              required
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
            >
              <option value="">Select Vehicle</option>
              {vehiclesQuery.data?.map((vehicle: any) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registrationNumber} ({vehicle.type})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Driver <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select
              required
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
            >
              <option value="">Select Driver</option>
              {driversQuery.data?.map((driver: any) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select
              required
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
            >
              <option value="">Select Branch</option>
              {branchesQuery.data?.map((branch: any) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-3">
        <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wide flex items-center gap-2">
          <Package className="w-4 h-4" /> Load & Notes
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Enter any additional notes..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? (mode === "edit" ? "Updating..." : "Creating...") : mode === "edit" ? "Update Manifest" : "Create Manifest"}
        </button>
        <button
          type="button"
          onClick={closeSidebar}
          className="px-6 py-3 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderViewSidebar = () => {
    if (!selectedManifest) return null;

    const manifest = selectedManifest;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-sky-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">{manifest.manifestNumber}</h3>
              <p className="text-xs text-sky-100">Trip: {manifest.tripNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(manifest.status)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-sky-600" /> Route Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Origin</p>
              <p className="font-semibold text-slate-800 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> {manifest.origin}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Destination</p>
              <p className="font-semibold text-slate-800 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-600" /> {manifest.destination}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Schedule
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Start</p>
              <p className="font-semibold text-slate-800 mt-1">
                {manifest.scheduledStart ? new Date(manifest.scheduledStart).toLocaleString("en-IN") : "N/A"}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Scheduled End</p>
              <p className="font-semibold text-slate-800 mt-1">
                {manifest.scheduledEnd ? new Date(manifest.scheduledEnd).toLocaleString("en-IN") : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" /> Assignment Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Vehicle</p>
              <p className="font-semibold text-slate-800 mt-1">{vehicleMap[manifest.vehicleId] || manifest.vehicleId}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Driver</p>
              <p className="font-semibold text-slate-800 mt-1">{driverMap[manifest.driverId] || manifest.driverId}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Branch</p>
              <p className="font-semibold text-slate-800 mt-1">{branchMap[manifest.branchId] || manifest.branchId}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Shipments</p>
              <p className="font-semibold text-slate-800 mt-1">{manifest.shipmentIds?.length || 0} linked</p>
            </div>
          </div>
        </div>

        {manifest.notes && (
          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" /> Notes
            </h4>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">{manifest.notes}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" /> System Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Created At</p>
              <p className="font-semibold text-slate-800 mt-1">
                {manifest.createdAt ? new Date(manifest.createdAt).toLocaleString("en-IN") : "N/A"}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Manifest ID</p>
              <p className="font-mono font-semibold text-slate-800 mt-1 break-all">{manifest.id}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => openEditForm(manifest)}
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Edit2 className="w-4 h-4" /> Edit Manifest
          </button>
          <button
            onClick={() => handleDelete(manifest)}
            className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-sky-900 to-blue-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 16 • Dispatch Desk
          </span>
          <h1 className="text-2xl font-black mt-2">Trip Sheet Manifest & Route Allocation</h1>
          <p className="text-xs text-sky-200 mt-1">Assign drivers and vehicles to scheduled orders with route optimization.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add New Manifest
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Manifests</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{manifests.length}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Planned</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {manifests.filter((m) => m.status === "planned").length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">In Transit</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">
            {manifests.filter((m) => m.status === "in_transit").length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Completed</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {manifests.filter((m) => m.status === "completed").length}
          </h3>
        </div>
      </div>

      {/* Active Manifest Roster Table */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-base text-slate-900">Active Manifest Roster ({manifests.length} Total Manifests)</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search origin, destination, manifest..."
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-40"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Manifest #</th>
                <th className="pb-3">Trip #</th>
                <th className="pb-3">Origin &rarr; Dest</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Driver</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Scheduled</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredManifests.map((manifest) => (
                <tr
                  key={manifest.id}
                  onClick={() => openViewSidebar(manifest)}
                  className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" /> {manifest.manifestNumber}
                  </td>
                  <td className="py-3.5 font-mono text-slate-600">{manifest.tripNumber}</td>
                  <td className="py-3.5">
                    <p className="font-semibold text-slate-800">{manifest.origin}</p>
                    <p className="text-[10px] text-slate-500">&rarr; {manifest.destination}</p>
                  </td>
                  <td className="py-3.5 font-medium">{vehicleMap[manifest.vehicleId] || manifest.vehicleId}</td>
                  <td className="py-3.5 font-medium">{driverMap[manifest.driverId] || manifest.driverId}</td>
                  <td className="py-3.5">{getStatusBadge(manifest.status)}</td>
                  <td className="py-3.5 font-medium">
                    {manifest.scheduledStart ? new Date(manifest.scheduledStart).toLocaleDateString("en-IN") : "N/A"}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewSidebar(manifest);
                        }}
                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(manifest);
                        }}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(manifest);
                        }}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredManifests.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                    No manifests found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Slide Sidebar Overlay */}
      {(sidebarMode === "form" || sidebarMode === "edit" || sidebarMode === "view") && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <h2 className="font-black text-base text-slate-900">
                {sidebarMode === "form"
                  ? "Add New Manifest"
                  : sidebarMode === "edit"
                    ? "Edit Manifest Details"
                    : "Manifest Details"}
              </h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {sidebarMode === "view" ? renderViewSidebar() : renderManifestForm(sidebarMode === "form" ? "form" : "edit")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

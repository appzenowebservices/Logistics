"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Save,
  MapPin,
  Calendar,
  Cpu,
  Shield,
  Activity,
  Gauge,
  FileText,
  User,
  Building2,
} from "lucide-react";

type VehicleFormData = {
  registrationNumber: string;
  type: string;
  model: string;
  capacity: string;
  status: string;
  driverId: string;
  branchId: string;
  gpsDeviceId: string;
  lastMaintenance: string;
  insuranceExpiry: string;
};

type Vehicle = {
  id: string;
  registrationNumber: string;
  type: string;
  model: string;
  capacity?: string;
  status: string;
  driverId?: string;
  branchId?: string;
  gpsDeviceId?: string;
  lastMaintenance?: Date;
  insuranceExpiry?: Date;
  createdAt: Date;
};

type SidebarMode = "form" | "view" | "edit" | null;

export default function FleetPageClient() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    registrationNumber: "",
    type: "Container (40ft)",
    model: "",
    capacity: "",
    status: "available",
    driverId: "",
    branchId: "",
    gpsDeviceId: "",
    lastMaintenance: "",
    insuranceExpiry: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.getSession.useQuery();
  const user = sessionData?.user;

  const listQuery = trpc.fleet.list.useQuery();
  const createMutation = trpc.fleet.create.useMutation();
  const updateMutation = trpc.fleet.update.useMutation();
  const deleteMutation = trpc.fleet.delete.useMutation();
  const getByIdQuery = trpc.fleet.getById.useQuery(
    { id: selectedVehicle?.id || "" },
    { enabled: !!selectedVehicle?.id && sidebarMode === "view" }
  );

  const branchesQuery = trpc.branches.list.useQuery();
  const driversQuery = trpc.drivers.list.useQuery();
  const managersQuery = trpc.managers.list.useQuery();

  const branchQuery = trpc.branches.getById.useQuery(
    { id: selectedBranchId },
    { enabled: !!selectedBranchId }
  );

  const driverQuery = trpc.drivers.getById.useQuery(
    { id: selectedDriverId },
    { enabled: !!selectedDriverId }
  );

  const assignmentVehicleQuery = trpc.fleet.getById.useQuery(
    { id: selectedVehicleId },
    { enabled: !!selectedVehicleId }
  );

  useEffect(() => {
    if (listQuery.data) {
      setVehicles(listQuery.data as Vehicle[]);
    }
  }, [listQuery.data]);

  useEffect(() => {
    if (getByIdQuery.data && selectedVehicle) {
      const detailed = getByIdQuery.data as any;
      setSelectedVehicle({
        id: detailed.id || detailed._id,
        registrationNumber: detailed.registrationNumber,
        type: detailed.type,
        model: detailed.model,
        capacity: detailed.capacity,
        status: detailed.status,
        driverId: detailed.driverId?.toString(),
        branchId: detailed.branchId?.toString(),
        gpsDeviceId: detailed.gpsDeviceId,
        lastMaintenance: detailed.lastMaintenance,
        insuranceExpiry: detailed.insuranceExpiry,
        createdAt: detailed.createdAt,
      });
    }
  }, [getByIdQuery.data]);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setSelectedVehicle(null);
    setFormData({
      registrationNumber: "",
      type: "Container (40ft)",
      model: "",
      capacity: "",
      status: "available",
      driverId: "",
      branchId: "",
      gpsDeviceId: "",
      lastMaintenance: "",
      insuranceExpiry: "",
    });
    setSidebarMode("form");
  };

  const openEditForm = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      model: vehicle.model,
      capacity: vehicle.capacity || "",
      status: vehicle.status,
      driverId: vehicle.driverId || "",
      branchId: vehicle.branchId || "",
      gpsDeviceId: vehicle.gpsDeviceId || "",
      lastMaintenance: vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toISOString().split("T")[0] : "",
      insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split("T")[0] : "",
    });
    setSidebarMode("edit");
  };

  const openViewSidebar = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSidebarMode("view");
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedVehicle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sidebarMode === "edit" && selectedVehicle) {
        await updateMutation.mutateAsync({
          id: selectedVehicle.id,
          ...formData,
        });
        await utils.fleet.list.invalidate();
        closeSidebar();
      } else {
        await createMutation.mutateAsync(formData);
        await utils.fleet.list.invalidate();
        closeSidebar();
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Are you sure you want to delete vehicle ${vehicle.registrationNumber}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: vehicle.id });
      await utils.fleet.list.invalidate();
      if (selectedVehicle?.id === vehicle.id) {
        closeSidebar();
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: "bg-emerald-100 text-emerald-800 border-emerald-200",
      in_transit: "bg-sky-100 text-sky-800 border-sky-200",
      maintenance: "bg-amber-100 text-amber-800 border-amber-200",
      dispatched: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusConfig[status as keyof typeof statusConfig] || "bg-slate-100 text-slate-800 border-slate-200"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const renderVehicleForm = (mode: "form" | "edit") => (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
          Registration Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Truck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            required
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            placeholder="DL-01-AB-1234"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Vehicle Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option>Container (40ft)</option>
            <option>Mini Truck</option>
            <option>Refrigerated Van</option>
            <option>Heavy Trailer</option>
            <option>Flatbed Truck</option>
            <option>Tanker</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="Tata Prima 4928.S"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Capacity (Tons)
          </label>
          <input
            type="text"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            placeholder="28.50"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="available">Available</option>
            <option value="in_transit">In Transit</option>
            <option value="maintenance">Maintenance</option>
            <option value="dispatched">Dispatched</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
          GPS Device ID
        </label>
        <div className="relative">
          <Cpu className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={formData.gpsDeviceId}
            onChange={(e) => setFormData({ ...formData, gpsDeviceId: e.target.value })}
            placeholder="GPS-IOT-9901"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Last Maintenance
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={formData.lastMaintenance}
              onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Insurance Expiry
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={formData.insuranceExpiry}
              onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
          Assigned Driver
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            value={formData.driverId}
            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
          >
            <option value="">Select Driver</option>
            {driversQuery.data?.map((driver: any) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
          Branch / Office
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? (mode === "edit" ? "Updating..." : "Registering...") : mode === "edit" ? "Update Vehicle" : "Register Vehicle"}
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
    if (!selectedVehicle) return null;

    const vehicle = selectedVehicle;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">{vehicle.registrationNumber}</h3>
              <p className="text-xs text-sky-100">{vehicle.type}</p>
            </div>
          </div>
          {getStatusBadge(vehicle.status)}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" /> Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Model</p>
              <p className="font-semibold text-slate-800 mt-1">{vehicle.model}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Capacity</p>
              <p className="font-semibold text-slate-800 mt-1">{vehicle.capacity || "N/A"} Tons</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
              <p className="mt-1">{getStatusBadge(vehicle.status)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">GPS Device</p>
              <p className="font-mono font-semibold text-sky-600 mt-1">{vehicle.gpsDeviceId || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Important Dates
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Last Maintenance</p>
              <p className="font-semibold text-slate-800 mt-1">
                {vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString("en-IN") : "N/A"}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Insurance Expiry</p>
              <p className="font-semibold text-slate-800 mt-1">
                {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString("en-IN") : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" /> Assignment Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Driver ID</p>
              <p className="font-mono font-semibold text-slate-800 mt-1 break-all">{vehicle.driverId || "Unassigned"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Branch ID</p>
              <p className="font-mono font-semibold text-slate-800 mt-1 break-all">{vehicle.branchId || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-600" /> System Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Created At</p>
              <p className="font-semibold text-slate-800 mt-1">
                {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString("en-IN") : "N/A"}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Vehicle ID</p>
              <p className="font-mono font-semibold text-slate-800 mt-1 break-all">{vehicle.id}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => openEditForm(vehicle)}
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Edit2 className="w-4 h-4" /> Edit Vehicle
          </button>
          <button
            onClick={() => handleDelete(vehicle)}
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
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 4 • Fleet Ecosystem
          </span>
          <h1 className="text-2xl font-black mt-2">Pan-India Fleet Master & Documents</h1>
          <p className="text-xs text-sky-200 mt-1">Manage registration, FASTag, PUC/Fitness permits, tyres, and CAN/OBD IoT sensors.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Register New Vehicle
        </button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Vehicles</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{vehicles.length}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Available</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {vehicles.filter((v) => v.status === "available").length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">In Transit</p>
          <h3 className="text-2xl font-black text-sky-600 mt-1">
            {vehicles.filter((v) => v.status === "in_transit").length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Maintenance</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {vehicles.filter((v) => v.status === "maintenance").length}
          </h3>
        </div>
      </div>

      {/* Assignment Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Branch Assignment Panel */}
        <div className="bg-white rounded-2xl p-5 border-t-4 border-blue-500 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-blue-600" /> Branch Assignment
          </h3>
          <div className="space-y-3">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select Branch</option>
              {branchesQuery.data?.map((branch: any) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>

            {selectedBranchId && (
              <div className="pt-2 space-y-2">
                {branchQuery.isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ) : branchQuery.data ? (
                  <>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Branch Name</p>
                      <p className="font-semibold text-slate-800 mt-1">{(branchQuery.data as any).name}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Branch Code</p>
                      <p className="font-semibold text-slate-800 mt-1">{(branchQuery.data as any).code || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Branch Manager</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {managersQuery.data?.find((m: any) => m.id === (branchQuery.data as any).managerId)?.name || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Manager Email</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {managersQuery.data?.find((m: any) => m.id === (branchQuery.data as any).managerId)?.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Manager Phone</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {managersQuery.data?.find((m: any) => m.id === (branchQuery.data as any).managerId)?.phone || "N/A"}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Driver Assignment Panel */}
        <div className="bg-white rounded-2xl p-5 border-t-4 border-emerald-500 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-emerald-600" /> Driver Assignment
          </h3>
          <div className="space-y-3">
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">Select Driver</option>
              {driversQuery.data?.map((driver: any) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.email})
                </option>
              ))}
            </select>

            {selectedDriverId && (
              <div className="pt-2 space-y-2">
                {driverQuery.isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ) : driverQuery.data ? (
                  <>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Driver Name</p>
                      <p className="font-semibold text-slate-800 mt-1">{(driverQuery.data as any).name}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Driver Email</p>
                      <p className="font-semibold text-slate-800 mt-1">{(driverQuery.data as any).email}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">License Number</p>
                      <p className="font-semibold text-slate-800 mt-1">{(driverQuery.data as any).compliance?.licenseNumber || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">License Class</p>
                      <p className="font-semibold text-slate-800 mt-1">{(driverQuery.data as any).compliance?.licenseClass || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">License Expiry</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {(driverQuery.data as any).compliance?.licenseExpiryDate
                          ? new Date((driverQuery.data as any).compliance.licenseExpiryDate).toLocaleDateString("en-IN")
                          : "N/A"}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Assignment Panel */}
        <div className="bg-white rounded-2xl p-5 border-t-4 border-amber-500 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-amber-600" /> Vehicle Assignment
          </h3>
          <div className="space-y-3">
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
            >
              <option value="">Select Vehicle</option>
              {listQuery.data?.map((vehicle: any) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registrationNumber} ({vehicle.type})
                </option>
              ))}
            </select>

            {selectedVehicleId && (
              <div className="pt-2 space-y-2">
                {assignmentVehicleQuery.isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ) : assignmentVehicleQuery.data ? (
                  <>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Registration Number</p>
                      <p className="font-semibold text-slate-800 mt-1">{(assignmentVehicleQuery.data as any).registrationNumber}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Type</p>
                      <p className="font-semibold text-slate-800 mt-1">{(assignmentVehicleQuery.data as any).type}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Model</p>
                      <p className="font-semibold text-slate-800 mt-1">{(assignmentVehicleQuery.data as any).model}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">GPS Device ID</p>
                      <p className="font-mono font-semibold text-sky-600 mt-1">{(assignmentVehicleQuery.data as any).gpsDeviceId || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <p className="mt-1">{getStatusBadge((assignmentVehicleQuery.data as any).status)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Last Maintenance</p>
                      <p className="font-semibold text-slate-800 mt-1">
                        {(assignmentVehicleQuery.data as any).lastMaintenance
                          ? new Date((assignmentVehicleQuery.data as any).lastMaintenance).toLocaleDateString("en-IN")
                          : "N/A"}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Fleet Roster Table */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-base text-slate-900">Active Fleet Roster ({vehicles.length} Total Vehicles)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reg, type, model, status..."
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Registration #</th>
                <th className="pb-3">Vehicle Type & Model</th>
                <th className="pb-3">GPS Device</th>
                <th className="pb-3">Insurance Expiry</th>
                <th className="pb-3">Operational Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  onClick={() => openViewSidebar(vehicle)}
                  className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-sky-600" /> {vehicle.registrationNumber}
                  </td>
                  <td className="py-3.5">
                    <p className="font-semibold text-slate-800">{vehicle.type}</p>
                    <p className="text-[10px] text-slate-500">{vehicle.model}</p>
                  </td>
                  <td className="py-3.5 font-mono text-sky-600 font-semibold">{vehicle.gpsDeviceId || "N/A"}</td>
                  <td className="py-3.5 font-medium">
                    {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString("en-IN") : "N/A"}
                  </td>
                  <td className="py-3.5">{getStatusBadge(vehicle.status)}</td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewSidebar(vehicle);
                        }}
                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(vehicle);
                        }}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vehicle);
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
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No vehicles found matching your search.
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
                  ? "Register New Vehicle"
                  : sidebarMode === "edit"
                    ? "Edit Vehicle Details"
                    : "Vehicle Details"}
              </h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{sidebarMode === "view" ? renderViewSidebar() : renderVehicleForm(sidebarMode === "form" ? "form" : "edit")}</div>
          </div>
        </div>
      )}
    </div>
  );
}

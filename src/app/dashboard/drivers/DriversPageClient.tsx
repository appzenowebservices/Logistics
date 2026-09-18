"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Save,
  Calendar,
  Shield,
  FileText,
  User,
  Phone,
  MapPin,
  Award,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type DriverFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  branchId: string;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseClass: string;
  policeVerificationStatus: string;
  policeVerificationDate: string;
  medicalCheckupStatus: string;
  medicalCheckupDate: string;
  aadharNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  phone: string;
  isActive: boolean;
};

type Driver = {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  compliance?: {
    licenseNumber: string;
    licenseIssueDate: Date;
    licenseExpiryDate: Date;
    licenseClass: string;
    policeVerificationStatus: string;
    policeVerificationDate?: Date;
    medicalCheckupStatus: string;
    medicalCheckupDate?: Date;
    aadharNumber?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
};

type SidebarMode = "form" | "view" | "edit" | null;

export default function DriversPageClient() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    email: "",
    password: "",
    role: "driver",
    branchId: "",
    licenseNumber: "",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    licenseClass: "Heavy Vehicle",
    policeVerificationStatus: "pending",
    policeVerificationDate: "",
    medicalCheckupStatus: "pending",
    medicalCheckupDate: "",
    aadharNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    phone: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.getSession.useQuery();
  const user = sessionData?.user;

  const listQuery = trpc.drivers.list.useQuery();
  const branchesQuery = trpc.branches.list.useQuery();
  const createMutation = trpc.drivers.create.useMutation();
  const updateMutation = trpc.drivers.update.useMutation();
  const deleteMutation = trpc.drivers.delete.useMutation();
  const getByIdQuery = trpc.drivers.getById.useQuery(
    { id: selectedDriver?.id || "" },
    { enabled: !!selectedDriver?.id && sidebarMode === "view" }
  );

  useEffect(() => {
    if (listQuery.data) {
      setDrivers(listQuery.data as Driver[]);
    }
  }, [listQuery.data]);

  useEffect(() => {
    if (getByIdQuery.data && selectedDriver) {
      const detailed = getByIdQuery.data as any;
      setSelectedDriver({
        id: detailed.id || detailed._id,
        name: detailed.name,
        email: detailed.email,
        role: detailed.role,
        branchId: detailed.branchId?.toString(),
        isActive: detailed.isActive,
        createdAt: detailed.createdAt,
        compliance: detailed.compliance,
      });
    }
  }, [getByIdQuery.data]);

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setSelectedDriver(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "driver",
      branchId: "",
      licenseNumber: "",
      licenseIssueDate: "",
      licenseExpiryDate: "",
      licenseClass: "Heavy Vehicle",
      policeVerificationStatus: "pending",
      policeVerificationDate: "",
      medicalCheckupStatus: "pending",
      medicalCheckupDate: "",
      aadharNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      phone: "",
      isActive: true,
    });
    setSidebarMode("form");
  };

  const openEditForm = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: "",
      role: driver.role,
      branchId: driver.branchId || "",
      licenseNumber: driver.compliance?.licenseNumber || "",
      licenseIssueDate: driver.compliance?.licenseIssueDate ? new Date(driver.compliance.licenseIssueDate).toISOString().split("T")[0] : "",
      licenseExpiryDate: driver.compliance?.licenseExpiryDate ? new Date(driver.compliance.licenseExpiryDate).toISOString().split("T")[0] : "",
      licenseClass: driver.compliance?.licenseClass || "Heavy Vehicle",
      policeVerificationStatus: driver.compliance?.policeVerificationStatus || "pending",
      policeVerificationDate: driver.compliance?.policeVerificationDate ? new Date(driver.compliance.policeVerificationDate).toISOString().split("T")[0] : "",
      medicalCheckupStatus: driver.compliance?.medicalCheckupStatus || "pending",
      medicalCheckupDate: driver.compliance?.medicalCheckupDate ? new Date(driver.compliance.medicalCheckupDate).toISOString().split("T")[0] : "",
      aadharNumber: driver.compliance?.aadharNumber || "",
      emergencyContactName: driver.compliance?.emergencyContactName || "",
      emergencyContactPhone: driver.compliance?.emergencyContactPhone || "",
      phone: driver.phone || "",
      isActive: driver.isActive,
    });
    setSidebarMode("edit");
  };

  const openViewSidebar = async (driver: Driver) => {
    setSelectedDriver(driver);
    setSidebarMode("view");
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedDriver(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sidebarMode === "edit" && selectedDriver) {
        await updateMutation.mutateAsync({
          id: selectedDriver.id,
          ...formData,
        });
        await utils.drivers.list.invalidate();
        closeSidebar();
      } else {
        await createMutation.mutateAsync(formData);
        await utils.drivers.list.invalidate();
        closeSidebar();
      }
    } catch (error) {
      console.error("Error saving driver:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: driver.id });
      await utils.drivers.list.invalidate();
      if (selectedDriver?.id === driver.id) {
        closeSidebar();
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
      passed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      expired: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusConfig[status as keyof typeof statusConfig] || "bg-slate-100 text-slate-800 border-slate-200"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const renderDriverForm = (mode: "form" | "edit") => (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
        <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wide flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Information
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Gurpreet Singh"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="driver@alms.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Password {mode === "form" && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={mode === "edit" ? "Leave blank to keep current" : "password123"}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91-9876543210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Branch
            </label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
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

      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
        <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4" /> License & Compliance
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Driving License Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            placeholder="DL-14201100982"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              License Issue Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={formData.licenseIssueDate}
                onChange={(e) => setFormData({ ...formData, licenseIssueDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              License Expiry Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              License Class
            </label>
            <select
              value={formData.licenseClass}
              onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option>Heavy Vehicle</option>
              <option>Light Vehicle</option>
              <option>Two Wheeler</option>
              <option>Others</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Aadhar Number
            </label>
            <input
              type="text"
              value={formData.aadharNumber}
              onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-3">
        <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-4 h-4" /> Verification Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Police Verification
            </label>
            <select
              value={formData.policeVerificationStatus}
              onChange={(e) => setFormData({ ...formData, policeVerificationStatus: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Police Verification Date
            </label>
            <input
              type="date"
              value={formData.policeVerificationDate}
              onChange={(e) => setFormData({ ...formData, policeVerificationDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Medical Checkup
            </label>
            <select
              value={formData.medicalCheckupStatus}
              onChange={(e) => setFormData({ ...formData, medicalCheckupStatus: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="pending">Pending</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Medical Checkup Date
            </label>
            <input
              type="date"
              value={formData.medicalCheckupDate}
              onChange={(e) => setFormData({ ...formData, medicalCheckupDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-3">
        <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wide flex items-center gap-2">
          <Phone className="w-4 h-4" /> Emergency Contact
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Emergency Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              placeholder="Kuldeep Singh"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Emergency Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              placeholder="+91-9876543210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? (mode === "edit" ? "Updating..." : "Registering...") : mode === "edit" ? "Update Driver" : "Register Driver"}
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
    if (!selectedDriver) return null;

    const driver = selectedDriver;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">{driver.name}</h3>
              <p className="text-xs text-sky-100">{driver.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20 border border-white/30">
              {driver.role.replace("_", " ")}
            </span>
            {driver.isActive ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">Active</span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-400/20 text-red-100 border border-red-400/30">Inactive</span>
            )}
          </div>
        </div>

        {driver.compliance && (
          <>
            <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" /> License Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">License Number</p>
                  <p className="font-mono font-semibold text-slate-800 mt-1">{driver.compliance.licenseNumber}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">License Class</p>
                  <p className="font-semibold text-slate-800 mt-1">{driver.compliance.licenseClass}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Issue Date</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {driver.compliance.licenseIssueDate ? new Date(driver.compliance.licenseIssueDate).toLocaleDateString("en-IN") : "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Expiry Date</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {driver.compliance.licenseExpiryDate ? new Date(driver.compliance.licenseExpiryDate).toLocaleDateString("en-IN") : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" /> Verification & Medical
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Police Verification</p>
                  <p className="mt-1">{getStatusBadge(driver.compliance.policeVerificationStatus)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Medical Checkup</p>
                  <p className="mt-1">{getStatusBadge(driver.compliance.medicalCheckupStatus)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-600" /> Emergency Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</p>
                  <p className="font-semibold text-slate-800 mt-1">{driver.compliance.emergencyContactName}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</p>
                  <p className="font-mono font-semibold text-slate-800 mt-1">{driver.compliance.emergencyContactPhone}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => openEditForm(driver)}
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Edit2 className="w-4 h-4" /> Edit Driver
          </button>
          <button
            onClick={() => handleDelete(driver)}
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
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Module 11 • Driver Ecosystem
          </span>
          <h1 className="text-2xl font-black mt-2">Driver Master & Safety Compliance</h1>
          <p className="text-xs text-sky-200 mt-1">Driving licenses, police verification, trip performance ratings, and attendance.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add New Driver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Drivers</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{drivers.length}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Active</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {drivers.filter((d) => d.isActive).length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Police Verified</p>
          <h3 className="text-2xl font-black text-sky-600 mt-1">
            {drivers.filter((d) => d.compliance?.policeVerificationStatus === "verified").length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Medical Passed</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {drivers.filter((d) => d.compliance?.medicalCheckupStatus === "passed").length}
          </h3>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-base text-slate-900">Driver Master Roster ({drivers.length} Total Drivers)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role..."
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Driver Name</th>
                <th className="pb-3">License Number</th>
                <th className="pb-3">Branch</th>
                <th className="pb-3">Police Verification</th>
                <th className="pb-3">Medical Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  onClick={() => openViewSidebar(driver)}
                  className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 font-bold text-slate-900">{driver.name}</td>
                  <td className="py-3.5 font-mono text-slate-600">{driver.compliance?.licenseNumber || "N/A"}</td>
                  <td className="py-3.5 font-medium">{driver.branchId ? "Assigned" : "Unassigned"}</td>
                  <td className="py-3.5">
                    {driver.compliance ? getStatusBadge(driver.compliance.policeVerificationStatus) : "N/A"}
                  </td>
                  <td className="py-3.5">
                    {driver.compliance ? getStatusBadge(driver.compliance.medicalCheckupStatus) : "N/A"}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewSidebar(driver);
                        }}
                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(driver);
                        }}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(driver);
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
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No drivers found matching your search.
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
                  ? "Add New Driver"
                  : sidebarMode === "edit"
                    ? "Edit Driver Details"
                    : "Driver Details"}
              </h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {sidebarMode === "view" ? renderViewSidebar() : renderDriverForm(sidebarMode === "form" ? "form" : "edit")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

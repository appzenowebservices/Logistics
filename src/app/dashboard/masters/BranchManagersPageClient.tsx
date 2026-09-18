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
  Phone,
  Mail,
  Building2,
  MapPin,
} from "lucide-react";
import OpenStreetMapPicker from "@/components/maps/OpenStreetMapPicker";

type BranchManagerFormData = {
  name: string;
  email: string;
  phone: string;
  pincodeAreaId: string;
  password: string;
  isActive: boolean;
  transferToManagerId?: string;
  lat?: number;
  lng?: number;
};

type BranchManager = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pincodeAreaId?: string;
  pincodeAreaName?: string;
  pincodeAreaState?: string;
  pincodeAreaCity?: string;
  isActive: boolean;
  createdAt: Date;
};

type Branch = {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
};

type SidebarMode = "form" | "view" | "edit" | null;
type StatusFilter = "all" | "active" | "inactive";

export default function BranchManagersPageClient() {
  const [managers, setManagers] = useState<BranchManager[]>([]);
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "name" | "email" | "phone" | "state" | "city">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<"name" | "email" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [selectedManager, setSelectedManager] = useState<BranchManager | null>(null);
  const [formData, setFormData] = useState<BranchManagerFormData>({
    name: "",
    email: "",
    phone: "",
    pincodeAreaId: "",
    password: "password123",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pincodeSearch, setPincodeSearch] = useState("");

  const utils = trpc.useUtils();

  const managersQuery = trpc.managers.list.useQuery();
  const pincodesQuery = trpc.pincodes.list.useQuery();
  const checkBranchManagerQuery = trpc.managers.checkBranchManager.useQuery(
    { pincodeAreaId: formData.pincodeAreaId || "" },
    { enabled: !!formData.pincodeAreaId && sidebarMode === "form" }
  );
  const createMutation = trpc.managers.create.useMutation();
  const updateMutation = trpc.managers.update.useMutation();
  const deleteMutation = trpc.managers.delete.useMutation();
  const getByIdQuery = trpc.managers.getById.useQuery(
    { id: selectedManager?.id || "" },
    { enabled: !!selectedManager?.id && sidebarMode === "view" }
  );

  useEffect(() => {
    if (managersQuery.data) {
      const enhanced = managersQuery.data.map((m: any) => {
        const pincode = pincodesQuery.data?.find((p: any) => p.id === m.pincodeAreaId?.toString());
        return {
          ...m,
          id: m.id || m._id?.toString(),
          pincodeAreaName: pincode?.name,
          pincodeAreaState: pincode?.state,
          pincodeAreaCity: pincode?.city,
        };
      });
      setManagers(enhanced);
    }
  }, [managersQuery.data, pincodesQuery.data]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        managersQuery.refetch();
        pincodesQuery.refetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [managersQuery, pincodesQuery]);

  useEffect(() => {
    if (pincodesQuery.data) {
      const activePincodes = pincodesQuery.data.filter((p: any) => p.branchStatus !== "inactive");
      setPincodes(activePincodes);
    }
  }, [pincodesQuery.data]);

  useEffect(() => {
    if (getByIdQuery.data) {
      const detailed = getByIdQuery.data as any;
      const pincode = pincodesQuery.data?.find((p: any) => p.id === detailed.pincodeAreaId?.toString());
      setSelectedManager({
        id: detailed.id || detailed._id,
        name: detailed.name,
        email: detailed.email,
        phone: detailed.phone,
        pincodeAreaId: detailed.pincodeAreaId?.toString(),
        pincodeAreaName: pincode?.name,
        pincodeAreaState: pincode?.state,
        pincodeAreaCity: pincode?.city,
        createdAt: detailed.createdAt,
        isActive: detailed.isActive,
      });
    }
  }, [getByIdQuery.data, pincodesQuery.data]);

  useEffect(() => {
    if (checkBranchManagerQuery.data && formData.pincodeAreaId && sidebarMode === "form") {
      if (checkBranchManagerQuery.data.hasManager) {
        const response = checkBranchManagerQuery.data as any;
        const msg = response.managerName 
          ? `This pincode area already has a manager assigned: ${response.managerName}`
          : "This pincode area already has a manager assigned";
        setErrorMessage(msg);
      } else {
        setErrorMessage(null);
      }
    }
  }, [checkBranchManagerQuery.data, formData.pincodeAreaId, sidebarMode]);

  const filteredManagers = managers
    .filter((m) => {
      if (statusFilter === "active") return m.isActive;
      if (statusFilter === "inactive") return !m.isActive;
      return true;
    })
    .filter((m) => {
      const matchesSearch = searchQuery.toLowerCase();
      switch (searchFilter) {
        case "name":
          return m.name.toLowerCase().includes(matchesSearch);
        case "email":
          return m.email.toLowerCase().includes(matchesSearch);
        case "phone":
          return (m.phone || "").toLowerCase().includes(matchesSearch);
        case "state":
          return (m.pincodeAreaState || "").toLowerCase().includes(matchesSearch);
        case "city":
          return (m.pincodeAreaCity || "").toLowerCase().includes(matchesSearch);
        default:
          return (
            m.name.toLowerCase().includes(matchesSearch) ||
            m.email.toLowerCase().includes(matchesSearch) ||
            (m.phone || "").toLowerCase().includes(matchesSearch) ||
            (m.pincodeAreaName || "").toLowerCase().includes(matchesSearch) ||
            (m.pincodeAreaState || "").toLowerCase().includes(matchesSearch) ||
            (m.pincodeAreaCity || "").toLowerCase().includes(matchesSearch)
          );
      }
    })
    .sort((a, b) => {
      const aVal = String(a[sortField] || "");
      const bVal = String(b[sortField] || "");
      if (sortOrder === "asc") {
        return aVal.localeCompare(bVal);
      }
      return bVal.localeCompare(aVal);
    });

  const openCreateForm = () => {
    setSelectedManager(null);
    setErrorMessage(null);
    setPincodeSearch("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      pincodeAreaId: "",
      password: "password123",
      isActive: true,
    });
    setSidebarMode("form");
  };

  const openEditForm = (manager: BranchManager) => {
    setSelectedManager(manager);
    setErrorMessage(null);
    setPincodeSearch("");
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone || "",
      pincodeAreaId: manager.pincodeAreaId || "",
      password: "password123",
      isActive: manager.isActive,
      transferToManagerId: "",
    });
    setSidebarMode("edit");
  };

  const openViewSidebar = async (manager: BranchManager) => {
    setSelectedManager(manager);
    setSidebarMode("view");
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedManager(null);
    setErrorMessage(null);
    setPincodeSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (sidebarMode === "form" && formData.pincodeAreaId && checkBranchManagerQuery.data?.hasManager) {
      const response = checkBranchManagerQuery.data as any;
      const msg = response.managerName 
        ? `This pincode area already has a manager assigned: ${response.managerName}`
        : "This pincode area already has a manager assigned";
      setErrorMessage(msg);
      return;
    }

    setIsSubmitting(true);

    try {
      if (sidebarMode === "edit" && selectedManager) {
        await updateMutation.mutateAsync({
          id: selectedManager.id,
          ...formData,
        });
        await utils.managers.list.invalidate();
        closeSidebar();
      } else {
        await createMutation.mutateAsync(formData);
        await utils.managers.list.invalidate();
        closeSidebar();
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Error saving manager");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (manager: BranchManager) => {
    if (!confirm(`Are you sure you want to delete manager ${manager.name}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: manager.id });
      await utils.managers.list.invalidate();
      if (selectedManager?.id === manager.id) {
        closeSidebar();
      }
    } catch (error) {
      console.error("Error deleting manager:", error);
    }
  };

  const renderManagerForm = (mode: "form" | "edit") => (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
        <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4" /> Basic Information
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Rajesh Kumar"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rajesh@alms.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91-9876543210"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

<div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
         <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide flex items-center gap-2">
           <Building2 className="w-4 h-4" /> Pincode Area Assignment
         </h4>
<div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Assign Pincode Area
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.pincodeAreaId ? pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.name + " (" + pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.pincode + ") - " + pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.city + ", " + pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.state : ""}
                onChange={(e) => {
                 setPincodeSearch(e.target.value);
                 if (e.target.value === "") {
                   setFormData({ ...formData, pincodeAreaId: "" });
                 }
               }}
               placeholder="Search pincode, city, state..."
               disabled={pincodesQuery.data?.length === 0}
               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
             />
             <div className="absolute right-3 top-3">
               <Search className="w-4 h-4 text-slate-400" />
             </div>
           </div>
{pincodeSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-white rounded-xl border border-slate-200 max-w-lg">
                {pincodesQuery.data
                  ?.filter((p: any) =>
                    p.pincode.toLowerCase().includes(pincodeSearch.toLowerCase()) ||
                    p.name.toLowerCase().includes(pincodeSearch.toLowerCase()) ||
                    p.city.toLowerCase().includes(pincodeSearch.toLowerCase()) ||
                    p.state.toLowerCase().includes(pincodeSearch.toLowerCase())
                  )
                  .map((pincode) => (
                    <button
                      key={pincode.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, pincodeAreaId: pincode.id });
                        setPincodeSearch("");
                      }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-emerald-50 border-b border-slate-100 last:border-0"
                    >
                      {pincode.name} ({pincode.pincode}) - {pincode.city}, {pincode.state}
                    </button>
                  ))}
                {pincodeSearch && pincodesQuery.data?.filter((p: any) =>
                  p.pincode.toLowerCase().includes(pincodeSearch.toLowerCase()) ||
                  p.name.toLowerCase().includes(pincodeSearch.toLowerCase()) ||
                  p.city.toLowerCase().includes(pincodeSearch.toLowerCase()) ||
                  p.state.toLowerCase().includes(pincodeSearch.toLowerCase())
                ).length === 0 && (
                  <p className="px-4 py-2 text-xs text-slate-500">No matching pincode areas found</p>
                )}
              </div>
            )}
           {pincodesQuery.data?.length === 0 && (
             <p className="text-[10px] text-amber-600 mt-2 font-medium">
               Add Pincode Areas first in Pincode Areas management.
             </p>
          )}
        </div>

          {formData.pincodeAreaId && (
            <div className="pt-3 border-t border-emerald-200">
              <OpenStreetMapPicker
                pincode={pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.pincode || ""}
                city={pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.city}
                state={pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.state}
                country="India"
                height="220px"
                readOnly
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">Active Manager</span>
            </label>
          </div>
          {!formData.isActive && selectedManager && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Transfer Assigned Branches</p>
              <p className="text-[10px] text-slate-500 mb-2">Select an active manager to transfer branches to:</p>
              <select
                value={formData.transferToManagerId || ""}
                onChange={(e) => setFormData({ ...formData, transferToManagerId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">No Transfer (branches will be unassigned)</option>
                {managersQuery.data
                  ?.filter((m) => m.isActive && m.id !== selectedManager.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
</div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || (sidebarMode === "form" && !!errorMessage) || pincodesQuery.data?.length === 0}
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? (mode === "edit" ? "Updating..." : "Creating...") : mode === "edit" ? "Update Manager" : "Create Manager"}
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
    if (!selectedManager) return null;

    const manager = selectedManager;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">{manager.name}</h3>
              <p className="text-xs text-sky-100">{manager.email}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
            manager.isActive ? "bg-emerald-500" : "bg-slate-500"
          } text-white`}>
            {manager.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" /> Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
              <p className="font-semibold text-slate-800 mt-1">{manager.phone || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
              <p className="font-semibold text-slate-800 mt-1">{manager.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" /> Assigned Pincode Area
          </h4>
          {manager.pincodeAreaId ? (
            <div className="space-y-3">
              <div className="space-y-1.5 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Area Name</p>
                  <p className="font-semibold text-slate-800">{manager.pincodeAreaName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                  <p className="font-semibold text-slate-800">
                    {manager.pincodeAreaCity || "N/A"}, {manager.pincodeAreaState || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-500">No pincode area assigned</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => openEditForm(manager)}
            disabled={pincodesQuery.data?.length === 0}
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit2 className="w-4 h-4" /> Edit Manager
          </button>
          <button
            onClick={() => handleDelete(manager)}
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
      <div className="bg-gradient-to-r from-indigo-900 to-sky-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Master Data • Branch Managers
          </span>
          <h1 className="text-2xl font-black mt-2">Branch Managers Management</h1>
          <p className="text-xs text-sky-100 mt-1">Manage all branch managers and their branch assignments.</p>
        </div>
<button
          onClick={openCreateForm}
          disabled={pincodesQuery.data?.length === 0}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add New Manager
        </button>
        {pincodesQuery.data?.length === 0 && (
          <p className="text-[10px] text-red-600 mt-2 font-medium">
            Pincode Areas must be added first before creating Branch Managers.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Managers</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{managers.length}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Active Managers</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {managers.filter((m) => m.isActive).length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">With Pincode Area</p>
          <h3 className="text-2xl font-black text-sky-600 mt-1">
            {managers.filter((m) => m.pincodeAreaId).length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Without Pincode Area</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {managers.filter((m) => !m.pincodeAreaId).length}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-base text-slate-900">All Branch Managers ({managers.length} Total)</h3>
<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex gap-1 bg-slate-50 rounded-xl p-1">
              {(["all", "active", "inactive"] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === status
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Fields</option>
              <option value="name">By Name</option>
              <option value="email">By Email</option>
              <option value="phone">By Phone</option>
              <option value="state">By Area State</option>
              <option value="city">By Area City</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search managers..."
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Pincode Area</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredManagers.map((manager) => (
                <tr
                  key={manager.id}
                  onClick={() => openViewSidebar(manager)}
                  className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 font-bold text-slate-900">{manager.name}</td>
                  <td className="py-3.5 font-medium">{manager.email}</td>
                  <td className="py-3.5">{manager.phone || "N/A"}</td>
                  <td className="py-3.5 font-medium">
                    {manager.pincodeAreaName || (manager.pincodeAreaId ? "Assigned" : "Unassigned")}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      manager.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {manager.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewSidebar(manager);
                        }}
                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(manager);
                        }}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(manager);
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
              {filteredManagers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No branch managers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(sidebarMode === "form" || sidebarMode === "edit" || sidebarMode === "view") && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <h2 className="font-black text-base text-slate-900">
                {sidebarMode === "form"
                  ? "Add New Branch Manager"
                  : sidebarMode === "edit"
                    ? "Edit Manager Details"
                    : "Manager Details"}
              </h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {sidebarMode === "view" ? renderViewSidebar() : renderManagerForm(sidebarMode === "form" ? "form" : "edit")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
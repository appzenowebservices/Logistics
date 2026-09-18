"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Save,
  Building2,
  Phone,
  Mail,
  User,
  Globe,
  Loader2,
} from "lucide-react";
import OpenStreetMapPicker from "@/components/maps/OpenStreetMapPicker";

type BranchFormData = {
  name: string;
  code: string;
  address: string;
  pincodeAreaId: string;
  phone: string;
  email: string;
  managerId: string;
  changeReason: string;
  lat?: number;
  lng?: number;
};

type BranchManager = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type PincodeArea = {
  id: string;
  name: string;
  pincode: string;
  city: string;
  state: string;
};

type Branch = {
  id: string;
  name: string;
  code: string;
  address?: string;
  pincodeAreaId: string;
  pincodeAreaName?: string;
  pincodeAreaPincode?: string;
  pincodeAreaCity?: string;
  pincodeAreaState?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  manager?: BranchManager;
  isActive?: boolean;
  changeReason?: string;
  createdAt: Date;
};

type SidebarMode = "form" | "view" | "edit" | null;

const fetchPincodeDetails = async (pincode: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    if (data && data[0] && data[0].Status === "Success") {
      const office = data[0].PostOffice[0];
      return {
        city: office.District || "",
        state: office.State || "",
      };
    }
    return null;
  } catch {
    return null;
  }
};

export default function BranchesPageClient() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    code: "",
    address: "",
    pincodeAreaId: "",
    phone: "",
    email: "",
    managerId: "",
    changeReason: "",
    lat: undefined,
    lng: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.getSession.useQuery();
  const user = sessionData?.user;

  const listQuery = trpc.branches.list.useQuery();
  const managersQuery = trpc.managers.list.useQuery();
  const pincodesQuery = trpc.pincodes.list.useQuery();
  const createMutation = trpc.branches.create.useMutation();
  const updateMutation = trpc.branches.update.useMutation();
  const deleteMutation = trpc.branches.delete.useMutation();

  useEffect(() => {
    if (listQuery.data) {
      const enhanced = listQuery.data
        .filter((b: any) => b.isActive !== false)
        .map((b: any) => {
        const pincode = pincodesQuery.data?.find((p: any) => p.id === b.pincodeAreaId?.toString());
        const manager = managersQuery.data?.find((m: any) => m.id === b.managerId?.toString());
        return {
          ...b,
          id: b.id || b._id?.toString(),
          pincodeAreaName: pincode?.name,
          pincodeAreaPincode: pincode?.pincode,
          pincodeAreaCity: pincode?.city,
          pincodeAreaState: pincode?.state,
          managerId: b.managerId?.toString(),
          manager: manager ? { id: manager.id, name: manager.name, email: manager.email, phone: manager.phone } : undefined,
        };
      });
      setBranches(enhanced);
    }
  }, [listQuery.data, pincodesQuery.data, managersQuery.data]);

  const [pincodeSearchQuery, setPincodeSearchQuery] = useState("");

  const handlePincodeAreaChange = (pincodeAreaId: string) => {
    const pincode = pincodesQuery.data?.find((p: any) => p.id === pincodeAreaId);
    let newCode = "";
    if (pincode) {
      const statePart = (pincode.state || "").replace(/\s/g, "").slice(0, 3).toUpperCase();
      const pincodeDigits = (pincode.pincode || "").replace(/\D/g, "");
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      newCode = `${statePart}${pincodeDigits}-HUB-${randomPart}`;
    }
    setFormData(prev => ({ 
      ...prev, 
      pincodeAreaId, 
      code: newCode,
      managerId: "",
      address: pincode?.branchAddress || pincode?.name || prev.address,
    }));
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.pincodeAreaName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.pincodeAreaState || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.pincodeAreaPincode || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setSelectedBranch(null);
    setPincodeSearchQuery("");
    setFormData({
      name: "",
      code: "",
      address: "",
      pincodeAreaId: "",
      phone: "",
      email: "",
      managerId: "",
      changeReason: "",
    });
    setSidebarMode("form");
  };

  const openEditForm = (branch: Branch) => {
    setSelectedBranch(branch);
    const pincode = pincodesQuery.data?.find((p: any) => p.id === branch.pincodeAreaId?.toString());
    setPincodeSearchQuery(pincode ? `${pincode.name} (${pincode.pincode}) - ${pincode.city}, ${pincode.state}` : "");
    setFormData({
      name: branch.name || "",
      code: branch.code || "",
      address: branch.address || "",
      pincodeAreaId: branch.pincodeAreaId || "",
      phone: branch.phone || "",
      email: branch.email || "",
      managerId: branch.managerId || "",
      changeReason: "",
    });
    setSidebarMode("edit");
  };

  const openViewSidebar = async (branch: Branch) => {
    setSelectedBranch(branch);
    setSidebarMode("view");
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedBranch(null);
    setPincodeSearchQuery("");
    setFormData(prev => ({ ...prev, changeReason: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sidebarMode === "edit" && selectedBranch) {
        const updatePayload: any = {
          id: selectedBranch.id,
          name: formData.name,
          address: formData.address,
          pincodeAreaId: formData.pincodeAreaId,
          phone: formData.phone,
          email: formData.email,
          managerId: formData.managerId,
        };
        
        if (user?.role === "super_admin" && formData.code && formData.code !== selectedBranch.code) {
          if (!formData.changeReason.trim()) {
            alert("Please provide a reason for changing the Branch Code.");
            setIsSubmitting(false);
            return;
          }
          updatePayload.code = formData.code;
          updatePayload.changeReason = formData.changeReason;
        }
        
        await updateMutation.mutateAsync(updatePayload);
        await utils.branches.list.invalidate();
        closeSidebar();
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          code: formData.code,
          address: formData.address,
          pincodeAreaId: formData.pincodeAreaId,
          phone: formData.phone,
          email: formData.email,
          managerId: formData.managerId,
        });
        await utils.branches.list.invalidate();
        closeSidebar();
      }
    } catch (error) {
      console.error("Error saving branch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`Are you sure you want to delete branch ${branch.name}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: branch.id });
      await utils.branches.list.invalidate();
      if (selectedBranch?.id === branch.id) {
        closeSidebar();
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
    }
  };

  const selectedManager = managersQuery.data?.find(
    (m) => m.id === formData.managerId
  );

  const renderBranchForm = (mode: "form" | "edit") => (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
        <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wide flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Basic Information
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Branch Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Delhi National Hub"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Branch Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            readOnly={mode === "form" || (mode === "edit" && user?.role !== "super_admin")}
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Auto-generated from pincode area"
            className={`flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-mono font-semibold text-xs ${(mode === "form" || (mode === "edit" && user?.role !== "super_admin")) ? "bg-slate-100 text-slate-600 cursor-not-allowed" : "bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"}`}
          />
          {mode === "edit" && user?.role === "super_admin" && (
            <p className="text-[10px] text-amber-600 mt-1 font-medium">
              Super Admin can modify branch code. Enter new code with reason below.
            </p>
          )}
          <p className="text-[10px] text-slate-500 mt-1">Unique branch code - auto-generated from selected Pincode Area's State & Pincode.</p>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="NH-8, Mahipalpur Logistics Park"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
        <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Pincode Area Selection
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Pincode Area <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={pincodeSearchQuery}
              onChange={(e) => {
                setPincodeSearchQuery(e.target.value);
                if (e.target.value === "") {
                  setFormData(prev => ({ ...prev, pincodeAreaId: "" }));
                }
              }}
              placeholder="Search pincode, city, state..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="absolute right-3 top-3">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          {pincodeSearchQuery && (
            <div className="mt-2 max-h-40 overflow-y-auto bg-white rounded-xl border border-slate-200 max-w-lg">
              {pincodesQuery.data
                ?.filter((p: any) =>
                  p.pincode.toLowerCase().includes(pincodeSearchQuery.toLowerCase()) ||
                  p.name.toLowerCase().includes(pincodeSearchQuery.toLowerCase()) ||
                  p.city.toLowerCase().includes(pincodeSearchQuery.toLowerCase()) ||
                  p.state.toLowerCase().includes(pincodeSearchQuery.toLowerCase())
                )
                .map((pincode: any) => (
                  <button
                    key={pincode.id}
                    type="button"
                    onClick={() => {
                      handlePincodeAreaChange(pincode.id);
                      setPincodeSearchQuery(`${pincode.name} (${pincode.pincode}) - ${pincode.city}, ${pincode.state}`);
                    }}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-emerald-50 border-b border-slate-100 last:border-0"
                  >
                    {pincode.name} ({pincode.pincode}) - {pincode.city}, {pincode.state}
                  </button>
                ))}
            </div>
          )}
          {pincodesQuery.data?.length === 0 && (
            <p className="text-[10px] text-red-600 mt-2 font-medium">
              Add Pincode Areas first in Pincode Areas management.
            </p>
          )}
        </div>
      </div>

      {formData.pincodeAreaId && (
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
          <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location Map
          </h4>
          <OpenStreetMapPicker
            pincode={pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.pincode || ""}
            address={formData.address}
            city={pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.city}
            state={pincodesQuery.data?.find((p: any) => p.id === formData.pincodeAreaId)?.state}
            country="India"
            height="260px"
            onLocationChange={(loc) => {
              setFormData((prev) => ({
                ...prev,
                lat: loc.lat,
                lng: loc.lng,
                address: loc.display_name || prev.address,
              }));
            }}
          />
        </div>
      )}

      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-3">
        <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wide flex items-center gap-2">
          <Phone className="w-4 h-4" /> Contact Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="+91-11-23456789"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="delhi@alms.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
        <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-2">
          <User className="w-4 h-4" /> Branch Manager
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Select Manager
          </label>
          <select
            value={formData.managerId}
            onChange={(e) => {
              const managerId = e.target.value;
              setFormData({ ...formData, managerId });
            }}
            disabled={!formData.pincodeAreaId || pincodesQuery.data?.length === 0}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a Branch Manager...</option>
            {managersQuery.data
              ?.filter((manager) => manager.pincodeAreaId === formData.pincodeAreaId && manager.isActive !== false)
              .map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
          </select>
          {!formData.pincodeAreaId && (pincodesQuery.data?.length ?? 0) > 0 && (
            <p className="text-[10px] text-amber-600 mt-2 font-medium">
              Select a Pincode Area first to see available Branch Managers.
            </p>
          )}
        </div>
        {selectedManager && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200">
            <p className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Manager Details</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{selectedManager.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-600">{selectedManager.email}</span>
              </div>
              {selectedManager.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600">{selectedManager.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "edit" && user?.role === "super_admin" && formData.code !== selectedBranch?.code && (
          <div className="mt-4 pt-3 border-t border-indigo-200">
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Reason for Branch Code Change <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.changeReason}
              onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
              placeholder="Specify reason for changing branch code..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || pincodesQuery.data?.length === 0}
          className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? (mode === "edit" ? "Updating..." : "Creating...") : mode === "edit" ? "Update Branch" : "Create Branch"}
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
    if (!selectedBranch) return null;

    const branch = selectedBranch;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">{branch.name}</h3>
              <p className="text-xs text-emerald-100">{branch.code}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" /> Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
              <p className="font-semibold text-slate-800 mt-1">{branch.address || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Pincode Area
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Area Name</p>
              <p className="font-semibold text-slate-800 mt-1">{branch.pincodeAreaName || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pincode</p>
              <p className="font-semibold text-slate-800 mt-1">{branch.pincodeAreaPincode || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">City</p>
              <p className="font-semibold text-slate-800 mt-1">{branch.pincodeAreaCity || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">State</p>
              <p className="font-semibold text-slate-800 mt-1">{branch.pincodeAreaState || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-600" /> Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
              <p className="font-semibold text-slate-800 mt-1">{branch.phone || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
              <p className="font-semibold text-slate-800 mt-1">{branch.email || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Branch Manager
          </h4>
          {branch.managerId ? (
            <div className="space-y-3">
              {managersQuery.data?.find((m) => m.id === branch.managerId && m.isActive !== false) ? (
                <div className="space-y-1.5 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Name</p>
                    <p className="font-semibold text-slate-800">{managersQuery.data?.find((m) => m.id === branch.managerId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                    <p className="font-semibold text-slate-800">{managersQuery.data?.find((m) => m.id === branch.managerId)?.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                    <p className="font-semibold text-slate-800">{managersQuery.data?.find((m) => m.id === branch.managerId)?.phone || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-red-600">Manager Inactive or Not Available</p>
              )}
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-500">No manager assigned</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => openEditForm(branch)}
            disabled={pincodesQuery.data?.length === 0}
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit2 className="w-4 h-4" /> Edit Branch
          </button>
          <button
            onClick={() => handleDelete(branch)}
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
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
            Master Data • Offices & Hubs
          </span>
          <h1 className="text-2xl font-black mt-2">Branches & Offices Management</h1>
          <p className="text-xs text-emerald-100 mt-1">Manage all PAN-India branch offices, hubs, and their assigned managers.</p>
        </div>
        <button
          onClick={openCreateForm}
          disabled={pincodesQuery.data?.length === 0}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add New Office
        </button>
        {pincodesQuery.data?.length === 0 && (
          <p className="text-[10px] text-red-600 font-medium">
            Pincode Areas must be added first before creating Branch Managers and Branches.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Branches</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{branches.length}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">States Covered</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {new Set(branches.map((b) => b.pincodeAreaState)).size}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Areas Covered</p>
          <h3 className="text-2xl font-black text-sky-600 mt-1">
            {branches.filter((b) => b.pincodeAreaId).length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">With Managers</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {branches.filter((b) => b.managerId).length}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-base text-slate-900">Active Offices & Hubs ({branches.length} Total)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, city, state..."
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Branch Code</th>
                <th className="pb-3">Branch Name</th>
                <th className="pb-3">Pincode Area</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Manager</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBranches.map((branch) => (
                <tr
                  key={branch.id}
                  onClick={() => openViewSidebar(branch)}
                  className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 font-mono font-bold text-sky-600">{branch.code}</td>
                  <td className="py-3.5 font-bold text-slate-900">{branch.name}</td>
                  <td className="py-3.5 font-medium">
                    {branch.pincodeAreaName || (branch.pincodeAreaId ? "Assigned" : "Unassigned")}
                  </td>
                  <td className="py-3.5 font-medium">
                    {branch.pincodeAreaCity}, {branch.pincodeAreaState}
                  </td>
                  <td className="py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{branch.phone || "N/A"}</span>
                      <span className="text-[10px] text-slate-500">{branch.email || "N/A"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-medium">
                     {branch.managerId ? (
                       (branch.manager as any)?.isActive === false || !managersQuery.data?.find((m) => m.id === branch.managerId && m.isActive !== false)
                         ? "Inactive"
                         : branch.manager?.name || managersQuery.data?.find((m) => m.id === branch.managerId)?.name || "Assigned"
                     ) : (
                       "Unassigned"
                     )}
                   </td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewSidebar(branch);
                        }}
                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(branch);
                        }}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(branch);
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
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No branches found matching your search.
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
                  ? "Add New Office"
                  : sidebarMode === "edit"
                    ? "Edit Branch Details"
                    : "Branch Details"}
              </h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {sidebarMode === "view" ? renderViewSidebar() : renderBranchForm(sidebarMode === "form" ? "form" : "edit")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
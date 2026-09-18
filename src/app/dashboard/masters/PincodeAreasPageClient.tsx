"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Globe,
  Loader2,
} from "lucide-react";

const fetchPincodeFromAPI = async (pincode: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    if (data && data[0] && data[0].Status === "Success") {
      return data[0].PostOffice[0];
    }
    return null;
  } catch {
    return null;
  }
};

const generateBranchCode = (state?: string, pincode?: string): string => {
  const statePrefix = (state || "")
    .replace(/[\s-]/g, "")
    .toUpperCase()
    .slice(0, 3);

  const pincodeDigits = (pincode || "")
    .replace(/[^\d]/g, "");

  const randomSuffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

  return `${statePrefix}${pincodeDigits}-HUB-${randomSuffix}`;
};

const fetchPincodesByCity = async (city: string, state: string): Promise<any[]> => {
  try {
    const response = await fetch(`https://api.postalpincode.in/postoffice/${city}`);
    const data = await response.json();
    if (data && data[0] && data[0].Status === "Success") {
      return data[0].PostOffice.filter((p: any) => 
        p.State.toLowerCase().includes(state.toLowerCase()) || 
        p.District.toLowerCase().includes(city.toLowerCase())
      );
    }
    return [];
  } catch {
    return [];
  }
};

type PincodeAreaFormData = {
  name: string;
  state: string;
  city: string;
  pincode: string;
  country: string;
  branchName: string;
  branchAddress: string;
  branchCode: string;
  branchState: string;
  branchCity: string;
  branchCountry: string;
  branchRegion: string;
  branchZone: string;
  branchDivision: string;
  branchDepartment: string;
  branchSection: string;
  branchUnit: string;
  branchTeam: string;
  branchGroup: string;
  branchCategory: string;
  branchType: string;
  branchStatus: string;
  lat?: number;
  lng?: number;
};

type PincodeArea = {
  id: string;
  name: string;
  state: string;
  city: string;
  pincode: string;
  country: string;
  branchName?: string;
  branchAddress?: string;
  branchCode?: string;
  branchState?: string;
  branchCity?: string;
  branchCountry?: string;
  branchRegion?: string;
  branchZone?: string;
  branchDivision?: string;
  branchDepartment?: string;
  branchSection?: string;
  branchUnit?: string;
  branchTeam?: string;
  branchGroup?: string;
  branchCategory?: string;
  branchType?: string;
  branchStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  branches?: {
    id: string;
    name: string;
    code: string;
    city: string;
    state: string;
  }[];
};

type SidebarMode = "form" | "view" | "edit" | null;
type StatusFilter = "all" | "active" | "inactive" | "pending" | "suspended";

export default function PincodeAreasPageClient() {
  const [pincodeAreas, setPincodeAreas] = useState<PincodeArea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "name" | "pincode" | "state" | "city">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<"name" | "pincode" | "city" | "state">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [selectedPincode, setSelectedPincode] = useState<PincodeArea | null>(null);
  const [formData, setFormData] = useState<PincodeAreaFormData>({
    name: "",
    state: "",
    city: "",
    pincode: "",
    country: "India",
    branchName: "",
    branchAddress: "",
    branchCode: "",
    branchState: "",
    branchCity: "",
    branchCountry: "",
    branchRegion: "",
    branchZone: "",
    branchDivision: "",
    branchDepartment: "",
    branchSection: "",
    branchUnit: "",
    branchTeam: "",
    branchGroup: "",
    branchCategory: "",
    branchType: "",
    branchStatus: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  const utils = trpc.useUtils();

  const pincodesQuery = trpc.pincodes.list.useQuery();
  const branchesQuery = trpc.branches.list.useQuery();
  const createMutation = trpc.pincodes.create.useMutation();
  const updateMutation = trpc.pincodes.update.useMutation();
  const deleteMutation = trpc.pincodes.delete.useMutation();
  const getByIdQuery = trpc.pincodes.getById.useQuery(
    { id: selectedPincode?.id || "" },
    { enabled: !!selectedPincode?.id && sidebarMode === "view" }
  );

  const fetchPincodeDetails = async (pincode: string) => {
    if (!pincode || pincode.length < 6) return;
    setIsFetchingPincode(true);
    try {
      const details = await fetchPincodeFromAPI(pincode);
      if (details) {
        setFormData(prev => ({
          ...prev,
          city: details.District || prev.city,
          state: details.State || prev.state,
          branchCity: details.District || prev.branchCity || prev.city,
          branchState: details.State || prev.branchState || prev.state,
          branchCountry: details.Country || prev.branchCountry || prev.country,
          branchName: prev.branchName || details.District ? `${details.District} Hub` : prev.branchName,
          branchCode: prev.branchCode || generateBranchCode(details.State, pincode),
          branchAddress: prev.branchAddress || details.District ? `${details.District}, ${details.State || prev.state} ${pincode}` : prev.branchAddress,
        }));
      }
    } catch (error) {
      console.error("Error fetching pincode:", error);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  useEffect(() => {
    if (pincodesQuery.data) {
      setPincodeAreas(pincodesQuery.data as PincodeArea[]);
    }
  }, [pincodesQuery.data]);

  useEffect(() => {
    if (getByIdQuery.data) {
      const detailed = getByIdQuery.data as any;
      const branches = branchesQuery.data?.filter((b: any) => b.pincodeAreaId?.toString() === detailed._id?.toString()) || [];
      setSelectedPincode({
        id: detailed.id || detailed._id,
        name: detailed.name,
        state: detailed.state,
        city: detailed.city,
        pincode: detailed.pincode,
        country: detailed.country,
        branchName: detailed.branchName,
        branchAddress: detailed.branchAddress,
        branchCode: detailed.branchCode,
        branchState: detailed.branchState,
        branchCity: detailed.branchCity,
        branchCountry: detailed.branchCountry,
        branchRegion: detailed.branchRegion,
        branchZone: detailed.branchZone,
        branchDivision: detailed.branchDivision,
        branchDepartment: detailed.branchDepartment,
        branchSection: detailed.branchSection,
        branchUnit: detailed.branchUnit,
        branchTeam: detailed.branchTeam,
        branchGroup: detailed.branchGroup,
        branchCategory: detailed.branchCategory,
        branchType: detailed.branchType,
        branchStatus: detailed.branchStatus,
        createdAt: detailed.createdAt,
        updatedAt: detailed.updatedAt,
        branches: branches.map((b: any) => ({ id: b.id, name: b.name, code: b.code, city: detailed.city, state: detailed.state })),
      });
    }
  }, [getByIdQuery.data, pincodesQuery.data, branchesQuery.data]);

  const filteredPincodes = pincodeAreas.map((p) => {
    const mappedBranches = branchesQuery.data?.filter((b: any) => b.pincodeAreaId?.toString() === p.id) || [];
    return {
      ...p,
      mappedBranches,
    };
  })
  .filter((p) => {
    if (statusFilter === "all") return true;
    return p.branchStatus === statusFilter;
  })
  .filter((p) => {
    const matchesSearch = searchQuery.toLowerCase();
    switch (searchFilter) {
      case "name":
        return p.name.toLowerCase().includes(matchesSearch);
      case "pincode":
        return p.pincode.toLowerCase().includes(matchesSearch);
      case "state":
        return p.state.toLowerCase().includes(matchesSearch);
      case "city":
        return p.city.toLowerCase().includes(matchesSearch);
      default:
        return (
          p.name.toLowerCase().includes(matchesSearch) ||
          p.pincode.toLowerCase().includes(matchesSearch) ||
          p.state.toLowerCase().includes(matchesSearch) ||
          p.city.toLowerCase().includes(matchesSearch) ||
          (p.branchName || "").toLowerCase().includes(matchesSearch) ||
          (p.branchCode || "").toLowerCase().includes(matchesSearch) ||
          p.mappedBranches.some((b: any) => b.name.toLowerCase().includes(matchesSearch))
        );
    }
  })
  .sort((a, b) => {
    const aVal = (a[sortField] as string) || "";
    const bVal = (b[sortField] as string) || "";
    if (sortOrder === "asc") {
      return aVal.localeCompare(bVal);
    }
    return bVal.localeCompare(aVal);
  });

  const branchesByPincode = branchesQuery.data?.filter((b: any) =>
    pincodeAreas.some((p: any) => p.id === b.pincodeAreaId?.toString())
  ) || [];

  const openCreateForm = () => {
    setSelectedPincode(null);
    setFormData({
      name: "",
      state: "",
      city: "",
      pincode: "",
      country: "India",
      branchName: "",
      branchAddress: "",
      branchCode: "",
      branchState: "",
      branchCity: "",
      branchCountry: "",
      branchRegion: "",
      branchZone: "",
      branchDivision: "",
      branchDepartment: "",
      branchSection: "",
      branchUnit: "",
      branchTeam: "",
      branchGroup: "",
      branchCategory: "",
      branchType: "",
      branchStatus: "active",
      lat: undefined,
      lng: undefined,
    });
    setSidebarMode("form");
  };

  const openEditForm = (pincode: PincodeArea) => {
    setSelectedPincode(pincode);
    setFormData({
      name: pincode.name,
      state: pincode.state,
      city: pincode.city,
      pincode: pincode.pincode,
      country: pincode.country,
      branchName: pincode.branchName || "",
      branchAddress: pincode.branchAddress || "",
      branchCode: pincode.branchCode || "",
      branchState: pincode.branchState || "",
      branchCity: pincode.branchCity || "",
      branchCountry: pincode.branchCountry || "",
      branchRegion: pincode.branchRegion || "",
      branchZone: pincode.branchZone || "",
      branchDivision: pincode.branchDivision || "",
      branchDepartment: pincode.branchDepartment || "",
      branchSection: pincode.branchSection || "",
      branchUnit: pincode.branchUnit || "",
      branchTeam: pincode.branchTeam || "",
      branchGroup: pincode.branchGroup || "",
      branchCategory: pincode.branchCategory || "",
      branchType: pincode.branchType || "",
      branchStatus: pincode.branchStatus || "active",
      lat: (pincode as any).lat,
      lng: (pincode as any).lng,
    });
    setSidebarMode("edit");
  };

  const openViewSidebar = async (pincode: PincodeArea) => {
    setSelectedPincode({
      ...pincode,
      branches: branchesQuery.data?.filter((b: any) => b.pincodeAreaId?.toString() === pincode.id).map((b: any) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        city: pincode.city,
        state: pincode.state
      })) || []
    });
    setSidebarMode("view");
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedPincode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sidebarMode === "edit" && selectedPincode) {
        await updateMutation.mutateAsync({
          id: selectedPincode.id,
          ...formData,
        });
        await utils.pincodes.list.invalidate();
        closeSidebar();
      } else {
        await createMutation.mutateAsync(formData);
        await utils.pincodes.list.invalidate();
        closeSidebar();
      }
    } catch (error) {
      console.error("Error saving pincode area:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pincode: PincodeArea) => {
    if (!confirm(`Are you sure you want to delete pincode area ${pincode.name}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: pincode.id });
      await utils.pincodes.list.invalidate();
      if (selectedPincode?.id === pincode.id) {
        closeSidebar();
      }
    } catch (error) {
      console.error("Error deleting pincode area:", error);
    }
  };

  const renderPincodeForm = (mode: "form" | "edit") => (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
        <h4 className="font-bold text-xs text-sky-900 uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Basic Information
        </h4>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Area Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Connaught Place"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
        <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="New Delhi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Delhi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Pincode <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="110001"
                onBlur={(e) => fetchPincodeDetails(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {isFetchingPincode && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="India"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        </div>

       <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-3">
         <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wide flex items-center gap-2">
           <Building2 className="w-4 h-4" /> Branch Information
         </h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
             <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
               Branch Name
             </label>
             <input
               type="text"
               value={formData.branchName}
               onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
               placeholder="Delhi National Hub"
               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
             />
           </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                Branch Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={formData.branchCode}
                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                placeholder="Auto-generated"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-semibold text-xs text-slate-600 cursor-not-allowed"
              />
            </div>
         </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
              Branch Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={formData.branchAddress}
              onChange={(e) => setFormData({ ...formData, branchAddress: e.target.value })}
              placeholder="Auto-filled from pincode / map"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-semibold text-xs text-slate-600 cursor-not-allowed"
            />
          </div>
       </div>

       <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
        <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-2">
          <Globe className="w-4 h-4" /> Branch Hierarchy
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Region</label>
            <input
              type="text"
              value={formData.branchRegion}
              onChange={(e) => setFormData({ ...formData, branchRegion: e.target.value })}
              placeholder="North"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Zone</label>
            <input
              type="text"
              value={formData.branchZone}
              onChange={(e) => setFormData({ ...formData, branchZone: e.target.value })}
              placeholder="Delhi NCR"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Division</label>
            <input
              type="text"
              value={formData.branchDivision}
              onChange={(e) => setFormData({ ...formData, branchDivision: e.target.value })}
              placeholder="Metropolitan"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Department</label>
            <input
              type="text"
              value={formData.branchDepartment}
              onChange={(e) => setFormData({ ...formData, branchDepartment: e.target.value })}
              placeholder="Operations"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Section</label>
            <input
              type="text"
              value={formData.branchSection}
              onChange={(e) => setFormData({ ...formData, branchSection: e.target.value })}
              placeholder="North Section"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Unit</label>
            <input
              type="text"
              value={formData.branchUnit}
              onChange={(e) => setFormData({ ...formData, branchUnit: e.target.value })}
              placeholder="Unit-A"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Team</label>
            <input
              type="text"
              value={formData.branchTeam}
              onChange={(e) => setFormData({ ...formData, branchTeam: e.target.value })}
              placeholder="Team-1"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase">Group</label>
            <input
              type="text"
              value={formData.branchGroup}
              onChange={(e) => setFormData({ ...formData, branchGroup: e.target.value })}
              placeholder="Group-A"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Category
          </label>
          <select
            value={formData.branchCategory}
            onChange={(e) => setFormData({ ...formData, branchCategory: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select Category</option>
            <option value="urban">Urban</option>
            <option value="rural">Rural</option>
            <option value="semi-urban">Semi-Urban</option>
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
            Status
          </label>
          <select
            value={formData.branchStatus}
            onChange={(e) => setFormData({ ...formData, branchStatus: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
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
          {isSubmitting ? (mode === "edit" ? "Updating..." : "Creating...") : mode === "edit" ? "Update Area" : "Create Area"}
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
    if (!selectedPincode) return null;

    const pincode = selectedPincode;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">{pincode.name}</h3>
              <p className="text-xs text-emerald-100">{pincode.pincode}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">City</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.city}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">State</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.state}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Country</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.country}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pincode</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.pincode}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" /> Branch Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Branch Name</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchName || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Branch Code</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchCode || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl sm:col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Branch Address</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchAddress || "N/A"}</p>
            </div>
          </div>

          {pincode.branches && pincode.branches.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Branches in this Area ({pincode.branches.length})</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pincode.branches.map((branch) => (
                  <div key={branch.id} className="bg-sky-50 p-2.5 rounded-lg">
                    <p className="font-semibold text-slate-800 text-xs">{branch.name}</p>
                    <p className="text-[10px] text-slate-600">{branch.code} • {branch.city}, {branch.state}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" /> Branch Hierarchy
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Region</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchRegion || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Zone</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchZone || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Division</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchDivision || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchDepartment || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Section</p>
              <p className="font-semibold text-slate-800 mt-1">{pincode.branchSection || "N/A"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pincode.branchStatus === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}>
                {pincode.branchStatus || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => openEditForm(pincode)}
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Edit2 className="w-4 h-4" /> Edit Area
          </button>
          <button
            onClick={() => handleDelete(pincode)}
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
            Master Data • Pincode Areas
          </span>
          <h1 className="text-2xl font-black mt-2">Pincode Areas Management</h1>
          <p className="text-xs text-emerald-100 mt-1">Manage all PIN-India pincode areas and their branch mappings.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add New Pincode Area
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Areas</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{pincodeAreas.length}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">States Covered</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {new Set(pincodeAreas.map((p) => p.state)).size}
          </h3>
        </div>
<div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
           <p className="text-xs font-semibold text-slate-500">With Branch Mapping</p>
           <h3 className="text-2xl font-black text-sky-600 mt-1">
             {pincodeAreas.filter((p) => branchesQuery.data?.some((b: any) => b.pincodeAreaId?.toString() === p.id)).length}
           </h3>
         </div>
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Active Areas</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {pincodeAreas.filter((p) => p.branchStatus === "active").length}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Pincode Areas ({filteredPincodes.length} Total)</h3>
            <div className="flex gap-1 mt-2">
              {(["all", "active", "inactive", "pending", "suspended"] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    statusFilter === status
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Fields</option>
              <option value="name">By Name</option>
              <option value="pincode">By Pincode</option>
              <option value="state">By State</option>
              <option value="city">By City</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search areas..."
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="pb-3">Area Name</th>
                <th className="pb-3">Pincode</th>
                <th className="pb-3">City & State</th>
                <th className="pb-3">Branch</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPincodes.map((pincode) => (
                <tr
                  key={pincode.id}
                  onClick={() => openViewSidebar(pincode)}
                  className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 font-bold text-slate-900">{pincode.name}</td>
                  <td className="py-3.5 font-mono text-sky-600">{pincode.pincode}</td>
                  <td className="py-3.5 font-medium">
                    {pincode.city}, {pincode.state}
                  </td>
                  <td className="py-3.5 font-medium">
                    {pincode.mappedBranches && pincode.mappedBranches.length > 0
                      ? pincode.mappedBranches.map((b) => b.name).join(", ")
                      : (pincode.branchName || "Unmapped")}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pincode.branchStatus === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {pincode.branchStatus || "active"}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewSidebar(pincode);
                        }}
                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(pincode);
                        }}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(pincode);
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
              {filteredPincodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No pincode areas found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(sidebarMode === "form" || sidebarMode === "edit" || sidebarMode === "view") &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50 bg-black/40" onClick={closeSidebar} />
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-300 z-[51] opacity-100 !block">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 h-[73px] shrink-0">
                <h2 className="font-black text-base text-slate-900">
                  {sidebarMode === "form"
                    ? "Add New Pincode Area"
                    : sidebarMode === "edit"
                      ? "Edit Pincode Area"
                      : "Pincode Area Details"}
                </h2>
                <button
                  onClick={closeSidebar}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="absolute top-[73px] bottom-0 left-0 right-0 overflow-y-auto p-5">
                {sidebarMode === "view" ? renderViewSidebar() : renderPincodeForm(sidebarMode === "form" ? "form" : "edit")}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Search,
  MapPin,
  Truck,
  User,
  Building2,
  Warehouse,
  Filter,
  Grid,
  Map,
  Layers,
  Navigation,
  Phone,
  Mail,
  X,
  ChevronDown,
  AlertCircle,
  Clock,
  Star,
  ExternalLink,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MARKER_COLORS: Record<string, string> = {
  company: "#dc2626",
  branch: "#2563eb",
  warehouse: "#9333ea",
  vehicle: "#16a34a",
  driver: "#ea580c",
  pincode: "#0891b2",
  user: "#64748b",
};

const MARKER_ICONS: Record<string, string> = {
  company: "🏢",
  branch: "🏪",
  warehouse: "🏭",
  vehicle: "🚛",
  driver: "👤",
  pincode: "📍",
  user: "👥",
};

type Entity = {
  type: string;
  id: string;
  name: string;
  subtitle: string;
  lat?: number;
  lng?: number;
  status: string;
  meta?: Record<string, any>;
};

type FilterState = {
  state: string;
  city: string;
  pincode: string;
  companyId: string;
  branchId: string;
  warehouseId: string;
  vehicleType: string;
  status: string;
  radius: number;
};

export default function GeoIntelligenceCenter() {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showResults, setShowResults] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    state: "",
    city: "",
    pincode: "",
    companyId: "",
    branchId: "",
    warehouseId: "",
    vehicleType: "",
    status: "",
    radius: 50,
  });

  const searchQuery = trpc.geo.search.useQuery(
    { query: query.trim(), filters: Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    ) },
    { enabled: false }
  );
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocodingIds, setGeocodingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapRef.current || mapInstanceRef.current) return;

    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: true,
        dragging: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const missing = results.filter((r) => !r.lat && !r.lng);
    if (missing.length === 0) return;

    const ids = new Set(missing.map((r) => r.id));
    setGeocodingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });

    const geocodeMissing = async () => {
      const updated = [...results];
      for (let i = 0; i < updated.length; i++) {
        const entity = updated[i];
        if (entity.lat && entity.lng) continue;

        const query = encodeURIComponent(entity.name + " " + entity.subtitle);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
          );
          const data = await res.json();
          if (data && data[0]) {
            updated[i] = {
              ...entity,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            };
          }
        } catch {
          // ignore geocode errors for individual entities
        }

        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      setResults(updated);
      setGeocodingIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    };

    geocodeMissing();
  }, [results]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    mapInstanceRef.current.invalidateSize();

    markersRef.current.forEach((m) => mapInstanceRef.current!.removeLayer(m));
    markersRef.current = [];

    const entitiesWithLoc = results.filter((r) => r.lat && r.lng);

    entitiesWithLoc.forEach((entity) => {
      const color = MARKER_COLORS[entity.type] || "#64748b";
      const icon = MARKER_ICONS[entity.type] || "📍";

      const markerHtml = `<div style="
        width:28px;height:28px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
      "><div style="transform:rotate(45deg);font-size:13px;line-height:1;">${icon}</div></div>`;

      const marker = L.marker([entity.lat!, entity.lng!], {
        icon: L.divIcon({
          html: markerHtml,
          className: "geo-marker-pin",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        }),
      })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<div style="font-size:12px;min-width:200px;font-family:system-ui;padding:2px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <div style="width:10px;height:10px;background:${color};border-radius:50%;"></div>
              <p style="font-weight:bold;color:#1e293b;margin:0;text-transform:capitalize;">${entity.type}</p>
            </div>
            <p style="font-weight:bold;color:#0f172a;margin:0 0 3px 0;font-size:13px;">${entity.name}</p>
            <p style="color:#64748b;margin:0 0 6px 0;font-size:11px;">${entity.subtitle}</p>
            ${entity.meta ? Object.entries(entity.meta).filter(([_, v]) => v).map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;padding:2px 0;border-top:1px solid #f1f5f9;">
                <span style="color:#94a3b8;text-transform:capitalize;font-size:10px;">${k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span style="color:#334155;font-weight:500;font-size:10px;">${typeof v === 'object' ? JSON.stringify(v) : v}</span>
              </div>
            `).join('') : ''}
            <div style="margin-top:6px;padding-top:4px;border-top:1px solid #f1f5f9;">
              <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:999px;background:${entity.status === 'active' ? '#dcfce7' : '#f1f5f9'};color:${entity.status === 'active' ? '#166534' : '#64748b'};font-size:9px;font-weight:bold;text-transform:capitalize;">
                ${entity.status}
              </span>
            </div>
          </div>`,
          { maxWidth: 260 }
        );

      marker.on("click", () => {
        setSelectedEntity(entity);
        setShowResults(false);
      });

      markersRef.current.push(marker);
    });

    if (entitiesWithLoc.length > 0) {
      const bounds = L.latLngBounds(
        entitiesWithLoc.map((e) => [e.lat!, e.lng!] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [results, mapLoaded]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchQuery.refetch();
      const data = res.data || [];
      setResults(data);
      setShowResults(true);
      setSelectedEntity(null);
    } catch (err: any) {
      setError(err?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof FilterState, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const entityIcon = (type: string) => {
    switch (type) {
      case "company": return <Building2 className="w-5 h-5" style={{ color: MARKER_COLORS.company }} />;
      case "branch": return <Building2 className="w-5 h-5" style={{ color: MARKER_COLORS.branch }} />;
      case "warehouse": return <Warehouse className="w-5 h-5" style={{ color: MARKER_COLORS.warehouse }} />;
      case "vehicle": return <Truck className="w-5 h-5" style={{ color: MARKER_COLORS.vehicle }} />;
      case "driver": return <User className="w-5 h-5" style={{ color: MARKER_COLORS.driver }} />;
      case "pincode": return <MapPin className="w-5 h-5" style={{ color: MARKER_COLORS.pincode }} />;
      default: return <MapPin className="w-5 h-5" style={{ color: MARKER_COLORS.user }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "available":
        return "bg-emerald-100 text-emerald-700";
      case "in_transit":
        return "bg-sky-100 text-sky-700";
      case "maintenance":
        return "bg-amber-100 text-amber-700";
      case "inactive":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Search Bar - Google Maps Style */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search pincode, city, branch, vehicle, driver..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 hover:from-sky-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wide">State</label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => updateFilter("state", e.target.value)}
                placeholder="Uttar Pradesh"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wide">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => updateFilter("city", e.target.value)}
                placeholder="Lucknow"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wide">Pincode</label>
              <input
                type="text"
                value={filters.pincode}
                onChange={(e) => updateFilter("pincode", e.target.value)}
                placeholder="226010"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wide">Vehicle Type</label>
              <input
                type="text"
                value={filters.vehicleType}
                onChange={(e) => updateFilter("vehicleType", e.target.value)}
                placeholder="Truck, Van, Bike"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wide">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="available">Available</option>
                <option value="in_transit">In Transit</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[10px] uppercase tracking-wide">Radius (KM)</label>
              <select
                value={filters.radius}
                onChange={(e) => updateFilter("radius", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="5">5 KM</option>
                <option value="10">10 KM</option>
                <option value="25">25 KM</option>
                <option value="50">50 KM</option>
                <option value="100">100 KM</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({
                    state: "",
                    city: "",
                    pincode: "",
                    companyId: "",
                    branchId: "",
                    warehouseId: "",
                    vehicleType: "",
                    status: "",
                    radius: 50,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Map + Results Sidebar */}
      <div className="flex-1 flex overflow-hidden h-full">
        {/* Map */}
        <div className="flex-1 relative h-full">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3 flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!mapLoaded && (
            <div className="absolute inset-0 z-[999] bg-slate-50 flex items-center justify-center">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-lg border border-slate-200">
                <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-bold text-slate-700">Loading map...</span>
              </div>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />

          {/* Legend Overlay */}
          {mapLoaded && (
            <div className="absolute bottom-6 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Legend
              </p>
              <div className="space-y-1.5">
                {Object.entries(MARKER_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-sm">{MARKER_ICONS[type]}</span>
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] font-semibold text-slate-600 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Count Badge */}
          {results.length > 0 && (
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-4 py-2">
              <p className="text-xs font-bold text-slate-700">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
          )}
        </div>

        {/* Results Sidebar - Full Height Google Maps Style */}
        {showResults && results.length > 0 && (
          <div className="w-96 bg-white border-l border-slate-200 overflow-y-auto z-10 shadow-xl flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-sm text-slate-900">Search Results</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {results.length} {results.length === 1 ? 'location' : 'locations'} found
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {results.map((entity) => (
                <div
                  key={`${entity.type}-${entity.id}`}
                  onClick={() => {
                    setSelectedEntity(entity);
                    if (entity.lat && entity.lng && mapInstanceRef.current) {
                      mapInstanceRef.current.invalidateSize();
                      mapInstanceRef.current.setView([entity.lat, entity.lng], 15);
                    }
                  }}
                  className="p-4 hover:bg-sky-50 cursor-pointer transition-colors group border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ backgroundColor: `${MARKER_COLORS[entity.type]}15` }}
                    >
                      {MARKER_ICONS[entity.type] || "📍"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">
                          {entity.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${getStatusColor(entity.status)}`}>
                          {entity.status}
                        </span>
                        {geocodingIds.has(entity.id) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 animate-pulse">
                            Locating...
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-sky-700 transition-colors">
                        {entity.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{entity.subtitle}</p>

                      {entity.lat && entity.lng && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {entity.lat.toFixed(6)}, {entity.lng.toFixed(6)}
                        </div>
                      )}

                      {entity.meta && Object.entries(entity.meta).filter(([_, v]) => v).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(entity.meta).filter(([_, v]) => v).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="font-semibold text-slate-700 truncate ml-2">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Entity Detail Panel */}
        {selectedEntity && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[60vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: `${MARKER_COLORS[selectedEntity.type]}15` }}
                >
                  {MARKER_ICONS[selectedEntity.type] || "📍"}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">
                    {selectedEntity.type}
                  </span>
                  <h3 className="font-black text-base text-slate-900 leading-tight">{selectedEntity.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${getStatusColor(selectedEntity.status)}`}>
                  {selectedEntity.status}
                </span>
                {selectedEntity.lat && selectedEntity.lng && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selectedEntity.lat}&mlon=${selectedEntity.lng}#map=16/${selectedEntity.lat}/${selectedEntity.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Open in OSM
                  </a>
                )}
              </div>

              <p className="text-sm text-slate-600">{selectedEntity.subtitle}</p>

              {selectedEntity.meta && Object.entries(selectedEntity.meta).filter(([_, v]) => v).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</h4>
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    {Object.entries(selectedEntity.meta).filter(([_, v]) => v).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-semibold text-slate-800 truncate ml-2">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntity.lat && selectedEntity.lng && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coordinates</h4>
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono font-semibold text-slate-700">
                      {selectedEntity.lat.toFixed(6)}, {selectedEntity.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Last updated: Just now
              </div>
              <button
                onClick={() => {
                  if (selectedEntity.lat && selectedEntity.lng && mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                    mapInstanceRef.current.setView([selectedEntity.lat, selectedEntity.lng], 16);
                    setTimeout(() => {
                      if (!mapInstanceRef.current) return;
                      mapInstanceRef.current.invalidateSize();
                      const marker = markersRef.current.find((m) => {
                        const ll = m.getLatLng();
                        return selectedEntity.lat != null && selectedEntity.lng != null && Math.abs(ll.lat - selectedEntity.lat) < 0.0001 && Math.abs(ll.lng - selectedEntity.lng) < 0.0001;
                      });
                      if (marker) {
                        marker.openPopup();
                      }
                    }, 300);
                  }
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Focus on Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

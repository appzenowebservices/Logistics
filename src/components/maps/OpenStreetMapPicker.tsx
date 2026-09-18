"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";

type AddressResult = {
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  display_name?: string;
  pincode?: string;
};

type OpenStreetMapPickerProps = {
  pincode?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  onLocationChange?: (location: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
    country?: string;
    display_name?: string;
    pincode?: string;
  }) => void;
  height?: string;
  readOnly?: boolean;
};

const pincodeCache = new Map<string, AddressResult>();

export default function OpenStreetMapPicker({
  pincode = "",
  address = "",
  city = "",
  state: stateInput = "",
  country = "India",
  onLocationChange,
  height = "320px",
  readOnly = false,
}: OpenStreetMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [addressParts, setAddressParts] = useState<AddressResult>({
    city: city,
    state: stateInput,
    country: country || "India",
    display_name: address,
  });

  const geocodeResultRef = useRef<AddressResult | null>(null);

  const defaultCenter = useMemo(() => ({ lat: 20.5937, lng: 78.9629 }), []);

  const applyMarker = async (parts: AddressResult) => {
    if (!mapInstanceRef.current || !parts.lat || !parts.lng) return;

    mapInstanceRef.current.setView([parts.lat, parts.lng], 14);
    mapInstanceRef.current.invalidateSize();

    if (markerRef.current) {
      markerRef.current.setLatLng([parts.lat, parts.lng]);
    } else {
      const L = (await import("leaflet")).default;
      const marker = L.marker([parts.lat, parts.lng], { draggable: !readOnly }).addTo(mapInstanceRef.current);
      marker.bindPopup(
        `<div style="font-size:12px;min-width:180px;">
          <p style="font-weight:bold;color:#1e293b;">${parts.display_name || "Selected Location"}</p>
          ${parts.city ? `<p style="color:#64748b;">City: ${parts.city}</p>` : ""}
          ${parts.state ? `<p style="color:#64748b;">State: ${parts.state}</p>` : ""}
          ${parts.pincode ? `<p style="color:#64748b;">Pincode: ${parts.pincode}</p>` : ""}
        </div>`
      );
      markerRef.current = marker;

      if (!readOnly) {
        marker.on("dragend", async (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          setLoading(true);
          try {
            const reverseRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
            );
            const reverseData = await reverseRes.json();
            if (reverseData && reverseData.address) {
              const newParts: AddressResult = {
                lat,
                lng,
                city: reverseData.address.city || reverseData.address.town || reverseData.address.district || reverseData.address.state_district || "",
                state: reverseData.address.state || "",
                country: reverseData.address.country || "India",
                display_name: reverseData.display_name || "",
                pincode: reverseData.address.postcode || pincode,
              };
              setAddressParts(newParts);
              geocodeResultRef.current = newParts;
              onLocationChange?.({
                lat,
                lng,
                city: newParts.city,
                state: newParts.state,
                country: newParts.country,
                display_name: newParts.display_name,
                pincode: newParts.pincode,
              });
            }
          } catch {
            // ignore reverse geocode errors
          } finally {
            setLoading(false);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        const DefaultIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon@2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
          center: [defaultCenter.lat, defaultCenter.lng],
          zoom: 5,
          scrollWheelZoom: !readOnly,
          dragging: !readOnly,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
        setLeafletLoaded(true);

        requestAnimationFrame(() => {
          map.invalidateSize();
        });

        if (geocodeResultRef.current) {
          applyMarker(geocodeResultRef.current);
        }
      } catch {
        // ignore leaflet load errors
      }
    };

    const timer = setTimeout(() => {
      if (!cancelled) initMap();
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [readOnly, defaultCenter.lat, defaultCenter.lng]);

  useEffect(() => {
    if (!pincode || pincode.length < 5) return;
    let cancelled = false;

    const geocode = async () => {
      setLoading(true);
      try {
        const cacheKey = `${pincode}-${country}`;
        let parts: AddressResult = pincodeCache.get(cacheKey) || {};

        if (!parts.lat || !parts.lng) {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&country=${encodeURIComponent(country)}&format=json&limit=1`
          );
          const data = await res.json();
          if (!cancelled && data && data[0]) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            parts = {
              lat,
              lng,
              display_name: data[0].display_name,
              pincode,
            };

            const detailRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
            );
            const detail = await detailRes.json();
            if (!cancelled && detail && detail.address) {
              parts.city = detail.address.city || detail.address.town || detail.address.district || detail.address.state_district || "";
              parts.state = detail.address.state || "";
              parts.country = detail.address.country || "India";
              parts.display_name = detail.display_name || data[0].display_name;
            }

            pincodeCache.set(cacheKey, parts);
          }
        }

        if (!cancelled && parts.lat && parts.lng) {
          geocodeResultRef.current = parts;
          setAddressParts(parts);
          onLocationChange?.({
            lat: parts.lat,
            lng: parts.lng,
            city: parts.city,
            state: parts.state,
            country: parts.country,
            display_name: parts.display_name,
            pincode,
          });

          if (mapInstanceRef.current) {
            await applyMarker(parts);
          }
        }
      } catch {
        // ignore geocode errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    geocode();
    return () => {
      cancelled = true;
    };
  }, [pincode, readOnly, onLocationChange, country]);

  const handleMapClick = async () => {
    if (readOnly || !mapInstanceRef.current) return;
    const center = mapInstanceRef.current.getCenter();
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${center.lat}&lon=${center.lng}&format=json&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.address) {
        const parts: AddressResult = {
          lat: center.lat,
          lng: center.lng,
          city: data.address.city || data.address.town || data.address.district || data.address.state_district || "",
          state: data.address.state || "",
          country: data.address.country || "India",
          display_name: data.display_name || "",
          pincode: data.address.postcode || pincode,
        };
        setAddressParts(parts);
        geocodeResultRef.current = parts;
        onLocationChange?.({
          lat: center.lat,
          lng: center.lng,
          city: parts.city,
          state: parts.state,
          country: parts.country,
          display_name: parts.display_name,
          pincode: parts.pincode,
        });

        const L = (await import("leaflet")).default;
        if (markerRef.current) {
          markerRef.current.setLatLng([center.lat, center.lng]);
        } else {
          const marker = L.marker([center.lat, center.lng], { draggable: true }).addTo(mapInstanceRef.current);
          marker.bindPopup(
            `<div style="font-size:12px;min-width:180px;">
              <p style="font-weight:bold;color:#1e293b;">${parts.display_name || "Selected Location"}</p>
              ${parts.city ? `<p style="color:#64748b;">City: ${parts.city}</p>` : ""}
              ${parts.state ? `<p style="color:#64748b;">State: ${parts.state}</p>` : ""}
              ${parts.pincode ? `<p style="color:#64748b;">Pincode: ${parts.pincode}</p>` : ""}
            </div>`
          );
          markerRef.current = marker;
          marker.on("dragend", async (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            setLoading(true);
            try {
              const reverseRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
              );
              const reverseData = await reverseRes.json();
              if (reverseData && reverseData.address) {
                const newParts: AddressResult = {
                  lat,
                  lng,
                  city: reverseData.address.city || reverseData.address.town || reverseData.address.district || reverseData.address.state_district || "",
                  state: reverseData.address.state || "",
                  country: reverseData.address.country || "India",
                  display_name: reverseData.display_name || "",
                  pincode: reverseData.address.postcode || pincode,
                };
                setAddressParts(newParts);
                geocodeResultRef.current = newParts;
                onLocationChange?.({
                  lat,
                  lng,
                  city: newParts.city,
                  state: newParts.state,
                  country: newParts.country,
                  display_name: newParts.display_name,
                  pincode: newParts.pincode,
                });
              }
            } catch {
              // ignore
            } finally {
              setLoading(false);
            }
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!leafletLoaded) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-slate-50" style={{ height }}>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg border border-slate-200">
            <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
            <span className="text-xs font-bold text-slate-700">Loading map...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg border border-slate-200">
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
              <span className="text-xs font-bold text-slate-700">Locating on map...</span>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        {!readOnly && (
          <div className="absolute top-3 right-3 z-[1000]">
            <button
              type="button"
              onClick={handleMapClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-md border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              Update from Map
            </button>
          </div>
        )}
      </div>

      {addressParts.display_name && (
        <div className="bg-sky-50 rounded-xl p-3 border border-sky-100 space-y-1.5">
          <p className="text-[10px] font-black text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Resolved Address
          </p>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">{addressParts.display_name}</p>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
            {addressParts.city && <span className="px-2 py-0.5 rounded-full bg-white border border-sky-200">City: {addressParts.city}</span>}
            {addressParts.state && <span className="px-2 py-0.5 rounded-full bg-white border border-sky-200">State: {addressParts.state}</span>}
            {addressParts.country && <span className="px-2 py-0.5 rounded-full bg-white border border-sky-200">Country: {addressParts.country}</span>}
            {addressParts.pincode && <span className="px-2 py-0.5 rounded-full bg-white border border-sky-200">Pincode: {addressParts.pincode}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

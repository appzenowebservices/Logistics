import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import mongoose from "mongoose";
import { User, Branch, Vehicle, PincodeArea, CompanyProfile, Warehouse } from "@/db/schema";

export const geoRouter = router({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        filters: z.object({
          state: z.string().optional(),
          city: z.string().optional(),
          pincode: z.string().optional(),
          companyId: z.string().optional(),
          branchId: z.string().optional(),
          warehouseId: z.string().optional(),
          vehicleType: z.string().optional(),
          status: z.string().optional(),
          radius: z.number().optional(),
          lat: z.number().optional(),
          lng: z.number().optional(),
        }).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const results: any[] = [];
      const q = input.query.toLowerCase();
      const f = input.filters || {};

      const buildMatch = (match: any) => {
        if (f.state) match.state = { $regex: f.state, $options: "i" };
        if (f.city) match.city = { $regex: f.city, $options: "i" };
        if (f.pincode) match.pincode = { $regex: f.pincode, $options: "i" };
        return match;
      };

      try {
        const companyMatch: any = { $or: [] };
        if (q) {
          (companyMatch.$or as any[]).push(
            { name: { $regex: q, $options: "i" } },
            { legalName: { $regex: q, $options: "i" } },
            { city: { $regex: q, $options: "i" } },
            { state: { $regex: q, $options: "i" } },
            { pincode: { $regex: q, $options: "i" } }
          );
        }
        const companyFiltered = buildMatch(companyMatch);
        const companies = await CompanyProfile.find(companyFiltered).limit(20).lean();
        results.push(
          ...companies.map((c: any) => ({
            type: "company",
            id: c._id.toString(),
            name: c.name,
            subtitle: c.city,
            lat: c.lat,
            lng: c.lng,
            status: "active",
            meta: { gstin: c.gstin, phone: c.phone, email: c.email, coverageRadius: c.coverageRadius },
          }))
        );
      } catch {
        // ignore company search errors
      }

      try {
        const branchMatch: any = { $or: [] };
        if (q) {
          (branchMatch.$or as any[]).push(
            { name: { $regex: q, $options: "i" } },
            { code: { $regex: q, $options: "i" } },
            { address: { $regex: q, $options: "i" } }
          );
        }
        const branchFiltered = buildMatch(branchMatch);
        const branches = await Branch.find(branchFiltered).limit(50).lean();
        results.push(
          ...branches.map((b: any) => ({
            type: "branch",
            id: b._id.toString(),
            name: b.name,
            subtitle: b.code,
            lat: b.lat,
            lng: b.lng,
            status: "active",
            meta: { address: b.address, phone: b.phone, email: b.email, managerId: b.managerId?.toString() },
          }))
        );
      } catch {
        // ignore branch search errors
      }

      try {
        const vehicleMatch: any = { $or: [] };
        if (q) {
          (vehicleMatch.$or as any[]).push(
            { registrationNumber: { $regex: q, $options: "i" } },
            { type: { $regex: q, $options: "i" } },
            { model: { $regex: q, $options: "i" } }
          );
        }
        if (f.vehicleType) vehicleMatch.type = { $regex: f.vehicleType, $options: "i" };
        if (f.status) vehicleMatch.status = f.status;
        const vehicles = await Vehicle.find(vehicleMatch).limit(50).lean();
        results.push(
          ...vehicles.map((v: any) => ({
            type: "vehicle",
            id: v._id.toString(),
            name: v.registrationNumber,
            subtitle: v.type,
            lat: v.lat,
            lng: v.lng,
            status: v.status,
            meta: { model: v.model, capacity: v.capacity, driverId: v.driverId?.toString(), branchId: v.branchId?.toString(), gpsDeviceId: v.gpsDeviceId },
          }))
        );
      } catch {
        // ignore vehicle search errors
      }

      try {
        const pincodeMatch: any = { $or: [] };
        if (q) {
          (pincodeMatch.$or as any[]).push(
            { name: { $regex: q, $options: "i" } },
            { pincode: { $regex: q, $options: "i" } },
            { city: { $regex: q, $options: "i" } },
            { state: { $regex: q, $options: "i" } }
          );
        }
        const pincodes = await PincodeArea.find(pincodeMatch).limit(30).lean();
        results.push(
          ...pincodes.map((p: any) => ({
            type: "pincode",
            id: p._id.toString(),
            name: p.name,
            subtitle: p.pincode,
            lat: p.lat,
            lng: p.lng,
            status: p.branchStatus || "active",
            meta: { city: p.city, state: p.state, country: p.country, branchName: p.branchName, branchCode: p.branchCode },
          }))
        );
      } catch {
        // ignore pincode search errors
      }

      try {
        const userMatch: any = { $or: [] };
        if (q) {
          (userMatch.$or as any[]).push(
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } }
          );
        }
        if (f.status && f.status !== "all") {
          userMatch.isActive = f.status === "active";
        }
        const users = await User.find(userMatch).limit(30).lean();
        results.push(
          ...users.map((u: any) => ({
            type: u.role === "driver" ? "driver" : "user",
            id: u._id.toString(),
            name: u.name,
            subtitle: u.role,
            lat: u.lat,
            lng: u.lng,
            status: u.isActive ? "active" : "inactive",
            meta: { email: u.email, phone: u.phone, branchId: u.branchId?.toString(), pincodeAreaId: u.pincodeAreaId?.toString() },
          }))
        );
      } catch {
        // ignore user search errors
      }

      try {
        const warehouseMatch: any = {};
        if (q) {
          warehouseMatch.$or = [
            { name: { $regex: q, $options: "i" } },
            { code: { $regex: q, $options: "i" } },
            { address: { $regex: q, $options: "i" } },
          ];
        }
        if (f.status) warehouseMatch.status = f.status;
        const warehouses = await Warehouse.find(warehouseMatch).limit(30).lean();
        results.push(
          ...warehouses.map((w: any) => ({
            type: "warehouse",
            id: w._id.toString(),
            name: w.name,
            subtitle: w.code,
            lat: w.lat,
            lng: w.lng,
            status: w.status || "active",
            meta: { address: w.address, phone: w.phone, email: w.email, branchId: w.branchId?.toString(), managerId: w.managerId?.toString(), capacity: w.capacity },
          }))
        );
      } catch {
        // ignore warehouse search errors
      }

      return results;
    }),
});

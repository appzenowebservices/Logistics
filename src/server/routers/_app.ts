import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import mongoose from "mongoose";
import { User, Branch, Vehicle, Shipment, Notification, DriverCompliance, TripManifest, PincodeArea, CompanyProfile, Warehouse } from "@/db/schema";
import { geoRouter } from "./geo";
import { seedDatabase, DEMO_USERS } from "@/lib/seed-data";
import { cookies } from "next/headers";

function generateBranchCode(state?: string, pincode?: string): string {
  const statePrefix = (state || "")
    .replace(/[\s-]/g, "")
    .toUpperCase()
    .slice(0, 3);

  const pincodeDigits = (pincode || "")
    .replace(/[^\d]/g, "");

  const randomSuffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

  return `${statePrefix}${pincodeDigits}-HUB-${randomSuffix}`;
}

export const appRouter = router({
  auth: router({
    getSession: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user) {
        return { authenticated: true, user: ctx.user };
      }
      return { authenticated: false, user: null };
    }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().optional(),
          password: z.string().optional(),
          role: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await seedDatabase();

        let targetUser: any = null;
        let demoMeta: any = null;

        if (input.role) {
          demoMeta = DEMO_USERS.find((u) => u.role === input.role) || DEMO_USERS[0];
          const found = await User.findOne({ role: demoMeta.role }).limit(1).lean();
          targetUser = found || {
            _id: new (mongoose.Types.ObjectId as any)(),
            name: demoMeta.name,
            email: demoMeta.email,
            role: demoMeta.role,
            branchId: new (mongoose.Types.ObjectId as any)(),
          };
        } else if (input.email) {
          const found = await User.findOne({ email: input.email }).lean();
          if (!found) {
            throw new Error("Invalid email or password");
          }
          targetUser = found;
          demoMeta = DEMO_USERS.find((u) => u.role === (targetUser as any).role) || DEMO_USERS[0];
        } else {
          throw new Error("Missing login credentials");
        }

        const sessionPayload = {
          id: (targetUser as any)._id.toString(),
          name: (targetUser as any).name,
          email: (targetUser as any).email,
          role: (targetUser as any).role,
          roleTitle: demoMeta?.roleTitle || (targetUser as any).role.replace(/_/g, " "),
          department: demoMeta?.department || "Operations",
          branchId: (targetUser as any).branchId?.toString() || new (mongoose.Types.ObjectId as any)().toString(),
        };

        const cookieStore = await cookies();
        cookieStore.set("alms_session", JSON.stringify(sessionPayload), { path: "/" });

        return { success: true, user: sessionPayload };
      }),

    logout: publicProcedure.mutation(async () => {
      const cookieStore = await cookies();
      cookieStore.delete("alms_session");
      return { success: true };
    }),
  }),

  seed: router({
    run: publicProcedure.mutation(async () => {
      const result = await seedDatabase();
      return result;
    }),
  }),

  bookings: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await Shipment.find().sort({ _id: -1 }).limit(20).lean();
        return list.map((item: any) => ({ ...item, id: item._id.toString(), customerId: item.customerId?.toString(), vehicleId: item.vehicleId?.toString(), driverId: item.driverId?.toString() }));
      } catch {
        return [];
      }
    }),

    create: publicProcedure
      .input(
        z.object({
          origin: z.string(),
          destination: z.string(),
          weight: z.string(),
          vehicleType: z.string(),
          fragile: z.boolean().default(false),
          temperatureControl: z.boolean().default(false),
          estimatedValue: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const trackingNumber = "ALMS-" + Math.floor(1000000 + Math.random() * 9000000);
        
        let freightRate = parseFloat(input.weight || "10") * 3200;
        if (input.fragile) freightRate += 4500;
        if (input.temperatureControl) freightRate += 8000;

        const shipment = new Shipment({
          trackingNumber,
          customerId: ctx.user?.id || new (mongoose.Types.ObjectId as any)(),
          origin: input.origin,
          destination: input.destination,
          status: "booked",
          weight: input.weight,
          value: input.estimatedValue,
        });

        await shipment.save();

        return {
          success: true,
          shipment: { ...shipment.toObject(), id: shipment._id.toString(), customerId: shipment.customerId?.toString(), vehicleId: shipment.vehicleId?.toString(), driverId: shipment.driverId?.toString() },
          calculatedFreightRate: Math.round(freightRate),
        };
      }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const shipment = await Shipment.findById(input.id).lean();
      if (!shipment) {
        throw new Error("Booking not found");
      }
      return { ...shipment, id: shipment._id.toString(), customerId: shipment.customerId?.toString(), vehicleId: shipment.vehicleId?.toString(), driverId: shipment.driverId?.toString() };
    }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          origin: z.string().optional(),
          destination: z.string().optional(),
          status: z.string().optional(),
          weight: z.string().optional(),
          value: z.string().optional(),
          estimatedDelivery: z.string().optional(),
          vehicleId: z.string().optional(),
          driverId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const shipmentUpdate: any = {};
        if (updateData.origin) shipmentUpdate.origin = updateData.origin;
        if (updateData.destination) shipmentUpdate.destination = updateData.destination;
        if (updateData.status) shipmentUpdate.status = updateData.status;
        if (updateData.weight !== undefined) shipmentUpdate.weight = updateData.weight;
        if (updateData.value !== undefined) shipmentUpdate.value = updateData.value;
        if (updateData.estimatedDelivery) shipmentUpdate.estimatedDelivery = new Date(updateData.estimatedDelivery);
        if (updateData.vehicleId) shipmentUpdate.vehicleId = updateData.vehicleId as any;
        if (updateData.driverId) shipmentUpdate.driverId = updateData.driverId as any;

        const shipment = await Shipment.findByIdAndUpdate(id, shipmentUpdate, { new: true }).lean();
        if (!shipment) {
          throw new Error("Booking not found");
        }
        return { success: true, shipment: { ...shipment, id: shipment._id.toString(), customerId: shipment.customerId?.toString(), vehicleId: shipment.vehicleId?.toString(), driverId: shipment.driverId?.toString() } };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      const result = await Shipment.findByIdAndDelete(input.id);
      if (!result) {
        throw new Error("Booking not found");
      }
      return { success: true };
    }),

    search: publicProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          customerName: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          const query: any = {};
          if (input.startDate || input.endDate) {
            query.createdAt = {};
            if (input.startDate) query.createdAt.$gte = new Date(input.startDate);
            if (input.endDate) query.createdAt.$lte = new Date(input.endDate + "T23:59:59");
          }
          if (input.customerName) {
            const matchingUsers = await User.find({ name: new RegExp(input.customerName, "i") }).lean();
            const userIds = matchingUsers.map((u: any) => u._id);
            query.customerId = { $in: userIds };
          }
          const list = await Shipment.find(query).sort({ _id: -1 }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString(), customerId: item.customerId?.toString(), vehicleId: item.vehicleId?.toString(), driverId: item.driverId?.toString() }));
        } catch {
          return [];
        }
      }),
  }),

  fleet: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await Vehicle.find().sort({ _id: -1 }).lean();
        return list.map((item: any) => ({ ...item, id: item._id.toString(), driverId: item.driverId?.toString(), branchId: item.branchId?.toString() }));
      } catch {
        return [];
      }
    }),

    create: publicProcedure
      .input(
        z.object({
          registrationNumber: z.string().min(1),
          type: z.string().min(1),
          model: z.string().min(1),
          capacity: z.string().optional(),
          status: z.string().default("available"),
          driverId: z.string().optional(),
          branchId: z.string().optional(),
          gpsDeviceId: z.string().optional(),
          lastMaintenance: z.string().optional(),
          insuranceExpiry: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const vehicle = new Vehicle({
          registrationNumber: input.registrationNumber,
          type: input.type,
          model: input.model,
          capacity: input.capacity,
          status: input.status,
          driverId: input.driverId ? new (mongoose.Types.ObjectId as any)(input.driverId) : undefined,
          branchId: input.branchId ? new (mongoose.Types.ObjectId as any)(input.branchId) : undefined,
          gpsDeviceId: input.gpsDeviceId,
          lastMaintenance: input.lastMaintenance ? new Date(input.lastMaintenance) : undefined,
          insuranceExpiry: input.insuranceExpiry ? new Date(input.insuranceExpiry) : undefined,
        });

        await vehicle.save();

        return { success: true, vehicle: { ...vehicle.toObject(), id: vehicle._id.toString() } };
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          registrationNumber: z.string().min(1).optional(),
          type: z.string().min(1).optional(),
          model: z.string().min(1).optional(),
          capacity: z.string().optional(),
          status: z.string().optional(),
          driverId: z.string().optional(),
          branchId: z.string().optional(),
          gpsDeviceId: z.string().optional(),
          lastMaintenance: z.string().optional(),
          insuranceExpiry: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.registrationNumber) updateData.registrationNumber = input.registrationNumber;
        if (input.type) updateData.type = input.type;
        if (input.model) updateData.model = input.model;
        if (input.capacity !== undefined) updateData.capacity = input.capacity;
        if (input.status) updateData.status = input.status;
        if (input.driverId !== undefined) updateData.driverId = input.driverId ? new (mongoose.Types.ObjectId as any)(input.driverId) : undefined;
        if (input.branchId !== undefined) updateData.branchId = input.branchId ? new (mongoose.Types.ObjectId as any)(input.branchId) : undefined;
        if (input.gpsDeviceId !== undefined) updateData.gpsDeviceId = input.gpsDeviceId;
        if (input.lastMaintenance !== undefined) updateData.lastMaintenance = input.lastMaintenance ? new Date(input.lastMaintenance) : undefined;
        if (input.insuranceExpiry !== undefined) updateData.insuranceExpiry = input.insuranceExpiry ? new Date(input.insuranceExpiry) : undefined;

        const vehicle = await Vehicle.findByIdAndUpdate(input.id, updateData, { new: true }).lean();
        if (!vehicle) {
          throw new Error("Vehicle not found");
        }

        return { success: true, vehicle: { ...vehicle, id: vehicle._id.toString(), driverId: vehicle.driverId?.toString(), branchId: vehicle.branchId?.toString() } };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      const result = await Vehicle.findByIdAndDelete(input.id);
      if (!result) {
        throw new Error("Vehicle not found");
      }
      return { success: true };
    }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const vehicle = await Vehicle.findById(input.id).lean();
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }
      return { ...vehicle, id: vehicle._id.toString(), driverId: vehicle.driverId?.toString(), branchId: vehicle.branchId?.toString() };
    }),
  }),

  drivers: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await User.find({ role: "driver" }).sort({ _id: -1 }).lean();
        const userIds = list.map((item: any) => item._id);
        const compliances = await DriverCompliance.find({ userId: { $in: userIds } }).lean();
        const complianceMap = new Map(compliances.map((c: any) => [c.userId.toString(), c]));
        return list.map((item: any) => ({
          ...item,
          id: item._id.toString(),
          branchId: item.branchId?.toString(),
          compliance: complianceMap.get(item._id.toString()),
        }));
      } catch {
        return [];
      }
    }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(1),
          role: z.string().default("driver"),
          branchId: z.string().optional(),
          licenseNumber: z.string().min(1),
          licenseIssueDate: z.string(),
          licenseExpiryDate: z.string(),
          licenseClass: z.string().default("Heavy Vehicle"),
          policeVerificationStatus: z.string().default("pending"),
          policeVerificationDate: z.string().optional(),
          medicalCheckupStatus: z.string().default("pending"),
          medicalCheckupDate: z.string().optional(),
          aadharNumber: z.string().optional(),
          emergencyContactName: z.string().min(1),
          emergencyContactPhone: z.string().min(1),
          phone: z.string().optional(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const driver = new User({
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
          branchId: input.branchId ? new (mongoose.Types.ObjectId as any)(input.branchId) : undefined,
          phone: input.phone,
          isActive: input.isActive,
        });

        await driver.save();

        const compliance = new DriverCompliance({
          userId: driver._id,
          licenseNumber: input.licenseNumber,
          licenseIssueDate: new Date(input.licenseIssueDate),
          licenseExpiryDate: new Date(input.licenseExpiryDate),
          licenseClass: input.licenseClass,
          policeVerificationStatus: input.policeVerificationStatus,
          policeVerificationDate: input.policeVerificationDate ? new Date(input.policeVerificationDate) : undefined,
          medicalCheckupStatus: input.medicalCheckupStatus,
          medicalCheckupDate: input.medicalCheckupDate ? new Date(input.medicalCheckupDate) : undefined,
          aadharNumber: input.aadharNumber,
          emergencyContactName: input.emergencyContactName,
          emergencyContactPhone: input.emergencyContactPhone,
        });

        await compliance.save();

        return { success: true, driver: { ...driver.toObject(), id: driver._id.toString() } };
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          password: z.string().min(1).optional(),
          role: z.string().optional(),
          branchId: z.string().optional(),
          licenseNumber: z.string().min(1).optional(),
          licenseIssueDate: z.string().optional(),
          licenseExpiryDate: z.string().optional(),
          licenseClass: z.string().optional(),
          policeVerificationStatus: z.string().optional(),
          policeVerificationDate: z.string().optional(),
          medicalCheckupStatus: z.string().optional(),
          medicalCheckupDate: z.string().optional(),
          aadharNumber: z.string().optional(),
          emergencyContactName: z.string().optional(),
          emergencyContactPhone: z.string().optional(),
          phone: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const driverUpdate: any = {};

        if (updateData.name) driverUpdate.name = updateData.name;
        if (updateData.email) driverUpdate.email = updateData.email;
        if (updateData.password) driverUpdate.password = updateData.password;
        if (updateData.role) driverUpdate.role = updateData.role;
        if (updateData.branchId !== undefined) driverUpdate.branchId = updateData.branchId ? new (mongoose.Types.ObjectId as any)(updateData.branchId) : undefined;
        if (updateData.phone !== undefined) driverUpdate.phone = updateData.phone;
        if (updateData.isActive !== undefined) driverUpdate.isActive = updateData.isActive;

        const driver = await User.findByIdAndUpdate(id, driverUpdate, { new: true }).lean();
        if (!driver) {
          throw new Error("Driver not found");
        }

        const complianceUpdate: any = {};
        if (updateData.licenseNumber) complianceUpdate.licenseNumber = updateData.licenseNumber;
        if (updateData.licenseIssueDate) complianceUpdate.licenseIssueDate = new Date(updateData.licenseIssueDate);
        if (updateData.licenseExpiryDate) complianceUpdate.licenseExpiryDate = new Date(updateData.licenseExpiryDate);
        if (updateData.licenseClass) complianceUpdate.licenseClass = updateData.licenseClass;
        if (updateData.policeVerificationStatus) complianceUpdate.policeVerificationStatus = updateData.policeVerificationStatus;
        if (updateData.policeVerificationDate) complianceUpdate.policeVerificationDate = new Date(updateData.policeVerificationDate);
        if (updateData.medicalCheckupStatus) complianceUpdate.medicalCheckupStatus = updateData.medicalCheckupStatus;
        if (updateData.medicalCheckupDate) complianceUpdate.medicalCheckupDate = new Date(updateData.medicalCheckupDate);
        if (updateData.aadharNumber !== undefined) complianceUpdate.aadharNumber = updateData.aadharNumber;
        if (updateData.emergencyContactName) complianceUpdate.emergencyContactName = updateData.emergencyContactName;
        if (updateData.emergencyContactPhone) complianceUpdate.emergencyContactPhone = updateData.emergencyContactPhone;

        const compliance = await DriverCompliance.findOneAndUpdate({ userId: id }, complianceUpdate, { new: true }).lean();

        return { success: true, driver: { ...driver, compliance, id: driver._id.toString(), branchId: driver.branchId?.toString() } };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await DriverCompliance.findOneAndDelete({ userId: input.id });
      const result = await User.findByIdAndDelete(input.id);
      if (!result) {
        throw new Error("Driver not found");
      }
      return { success: true };
    }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const driver = await User.findById(input.id).lean();
      if (!driver) {
        throw new Error("Driver not found");
      }
      const compliance = await DriverCompliance.findOne({ userId: input.id }).lean();
      return { ...driver, compliance, id: driver._id.toString(), branchId: driver.branchId?.toString() };
    }),
  }),

managers: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await User.find({ role: "branch_manager" }).sort({ name: 1 }).lean();
        return list.map((item: any) => ({
          ...item,
          id: item._id.toString(),
          phone: item.phone,
          pincodeAreaId: item.pincodeAreaId?.toString(),
          branchId: item.branchId?.toString(),
        }));
      } catch {
        return [];
      }
    }),

    checkAssignment: publicProcedure
      .input(z.object({ managerId: z.string() }))
      .query(async ({ input }) => {
        const manager = await User.findById(input.managerId).lean();
        if (!manager || manager.role !== "branch_manager") {
          return { assigned: false, message: "Manager not found" };
        }
        if (manager.pincodeAreaId) {
          const assignedPincode = await PincodeArea.findById(manager.pincodeAreaId).lean();
          return {
            assigned: true,
            pincodeAreaId: manager.pincodeAreaId.toString(),
            pincodeAreaName: assignedPincode?.name || "Unknown Area",
            message: `This manager is already assigned to ${assignedPincode?.name || "a pincode area"}`,
          };
        }
        return { assigned: false };
      }),

    checkBranchManager: publicProcedure
      .input(z.object({ pincodeAreaId: z.string() }))
      .query(async ({ input }) => {
        const manager = await User.findOne({ role: "branch_manager", pincodeAreaId: input.pincodeAreaId }).lean();
        if (manager) {
          return {
            hasManager: true,
            managerId: manager._id.toString(),
            managerName: manager.name,
            message: `This pincode area already has a manager assigned: ${manager.name}`,
          };
        }
        return { hasManager: false };
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          password: z.string().min(1),
          pincodeAreaId: z.string().optional(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        if (input.pincodeAreaId) {
          const existingManager = await User.findOne({ role: "branch_manager", pincodeAreaId: input.pincodeAreaId });
          if (existingManager) {
            throw new Error("This pincode area already has a manager assigned. Each pincode area can have only one manager.");
          }
        }

        const manager = new User({
          name: input.name,
          email: input.email,
          phone: input.phone,
          password: input.password,
          role: "branch_manager",
          pincodeAreaId: input.pincodeAreaId ? new (mongoose.Types.ObjectId as any)(input.pincodeAreaId) : undefined,
          isActive: input.isActive,
        });

        await manager.save();

        return { success: true, manager: { ...manager.toObject(), id: manager._id.toString(), pincodeAreaId: manager.pincodeAreaId?.toString() } };
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          password: z.string().min(1).optional(),
          pincodeAreaId: z.string().optional(),
          isActive: z.boolean().optional(),
          transferToManagerId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        if (input.pincodeAreaId) {
          const existingManager = await User.findOne({ 
            role: "branch_manager", 
            pincodeAreaId: input.pincodeAreaId,
            _id: { $ne: new (mongoose.Types.ObjectId as any)(input.id) }
          });
          if (existingManager) {
            throw new Error("This pincode area already has a manager assigned. Each pincode area can have only one manager.");
          }
        }

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.password) updateData.password = input.password;
        if (input.pincodeAreaId !== undefined) updateData.pincodeAreaId = input.pincodeAreaId ? new (mongoose.Types.ObjectId as any)(input.pincodeAreaId) : undefined;
        
        if (input.isActive === false && input.transferToManagerId) {
          const branchesToTransfer = await Branch.find({ managerId: input.id }).lean();
          if (branchesToTransfer.length > 0) {
            await Branch.updateMany(
              { managerId: input.id },
              { managerId: new (mongoose.Types.ObjectId as any)(input.transferToManagerId) }
            );
          }
        }
        
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const manager = await User.findByIdAndUpdate(input.id, updateData, { new: true }).lean();
        if (!manager) {
          throw new Error("Branch Manager not found");
        }

        return { success: true, manager: { ...manager, id: manager._id.toString(), pincodeAreaId: manager.pincodeAreaId?.toString() } };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      const result = await User.findByIdAndDelete(input.id);
      if (!result) {
        throw new Error("Branch Manager not found");
      }
      return { success: true };
    }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const manager = await User.findById(input.id).lean();
      if (!manager) {
        throw new Error("Branch Manager not found");
      }
      return { ...manager, id: manager._id.toString(), pincodeAreaId: manager.pincodeAreaId?.toString(), branchId: manager.branchId?.toString() };
    }),

    searchByStateCity: publicProcedure
      .input(z.object({ state: z.string(), city: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            $or: [
              { "branch.city": { $regex: input.state, $options: "i" } },
              { "branch.state": { $regex: input.state, $options: "i" } },
            ]
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByName: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            name: { $regex: input.name, $options: "i" }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByContact: publicProcedure
      .input(z.object({ contact: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            $or: [
              { phone: { $regex: input.contact, $options: "i" } },
              { email: { $regex: input.contact, $options: "i" } }
            ]
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByEmail: publicProcedure
      .input(z.object({ email: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            email: { $regex: input.email, $options: "i" }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCode: publicProcedure
      .input(z.object({ branchCode: z.string() }))
      .query(async ({ input }) => {
        try {
          const branch = await Branch.findOne({ code: input.branchCode }).lean();
          if (!branch) return [];
          const list = await User.find({
            role: "branch_manager",
            branchId: branch._id
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchName: publicProcedure
      .input(z.object({ branchName: z.string() }))
      .query(async ({ input }) => {
        try {
          const branch = await Branch.findOne({ name: { $regex: input.branchName, $options: "i" } }).lean();
          if (!branch) return [];
          const list = await User.find({
            role: "branch_manager",
            branchId: branch._id
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchAddress: publicProcedure
      .input(z.object({ branchAddress: z.string() }))
      .query(async ({ input }) => {
        try {
          const branch = await Branch.findOne({ address: { $regex: input.branchAddress, $options: "i" } }).lean();
          if (!branch) return [];
          const list = await User.find({
            role: "branch_manager",
            branchId: branch._id
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchPincodeArea: publicProcedure
      .input(z.object({ pincode: z.string() }))
      .query(async ({ input }) => {
        try {
          const branch = await Branch.findOne({ pincode: input.pincode }).lean();
          if (!branch) return [];
          const list = await User.find({
            role: "branch_manager",
            branchId: branch._id
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchState: publicProcedure
      .input(z.object({ branchState: z.string() }))
      .query(async ({ input }) => {
        try {
          const branches = await Branch.find({ state: { $regex: input.branchState, $options: "i" } }).lean();
          const branchIds = branches.map((b: any) => b._id);
          const list = await User.find({
            role: "branch_manager",
            branchId: { $in: branchIds }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCity: publicProcedure
      .input(z.object({ branchCity: z.string() }))
      .query(async ({ input }) => {
        try {
          const branches = await Branch.find({ city: { $regex: input.branchCity, $options: "i" } }).lean();
          const branchIds = branches.map((b: any) => b._id);
          const list = await User.find({
            role: "branch_manager",
            branchId: { $in: branchIds }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCountry: publicProcedure
      .input(z.object({ branchCountry: z.string() }))
      .query(async ({ input }) => {
        try {
          const branches = await Branch.find({ country: { $regex: input.branchCountry, $options: "i" } }).lean();
          const branchIds = branches.map((b: any) => b._id);
          const list = await User.find({
            role: "branch_manager",
            branchId: { $in: branchIds }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchRegion: publicProcedure
      .input(z.object({ branchRegion: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchZone: publicProcedure
      .input(z.object({ branchZone: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchDivision: publicProcedure
      .input(z.object({ branchDivision: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchDepartment: publicProcedure
      .input(z.object({ branchDepartment: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchSection: publicProcedure
      .input(z.object({ branchSection: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchUnit: publicProcedure
      .input(z.object({ branchUnit: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchTeam: publicProcedure
      .input(z.object({ branchTeam: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchGroup: publicProcedure
      .input(z.object({ branchGroup: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCategory: publicProcedure
      .input(z.object({ branchCategory: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchType: publicProcedure
      .input(z.object({ branchType: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            branch: { $exists: true }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchStatus: publicProcedure
      .input(z.object({ branchStatus: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await User.find({
            role: "branch_manager",
            isActive: input.branchStatus === "active"
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),
  }),

  branches: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await Branch.find().sort({ _id: -1 }).lean();
        return list.map((item: any) => ({ ...item, id: item._id.toString(), managerId: item.managerId?.toString(), pincodeAreaId: item.pincodeAreaId?.toString() }));
      } catch {
        return [];
      }
    }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          code: z.string().optional(),
          address: z.string().optional(),
          pincodeAreaId: z.string().min(1),
          phone: z.string().optional(),
          email: z.string().optional(),
          managerId: z.string().optional(),
          changeReason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const pincodeArea = await PincodeArea.findById(input.pincodeAreaId);
        if (!pincodeArea) {
          throw new Error("Pincode Area not found");
        }
        
        const branchCode = input.code || generateBranchCode(pincodeArea.state, pincodeArea.pincode);
        
        const existingBranch = await Branch.findOne({ code: branchCode });
        if (existingBranch) {
          throw new Error("Branch code must be unique. This code already exists.");
        }

        const branch = new Branch({
          name: input.name,
          code: branchCode,
          address: input.address,
          pincodeAreaId: new (mongoose.Types.ObjectId as any)(input.pincodeAreaId),
          phone: input.phone,
          email: input.email,
          managerId: input.managerId ? new (mongoose.Types.ObjectId as any)(input.managerId) : undefined,
          changeReason: input.changeReason,
        });

        await branch.save();

        return { success: true, branch: { ...branch.toObject(), id: branch._id.toString() } };
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          code: z.string().min(1).optional(),
          address: z.string().optional(),
          pincodeAreaId: z.string().min(1).optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          managerId: z.string().optional(),
          changeReason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        if (input.code) {
          const existingBranch = await Branch.findOne({ code: input.code, _id: { $ne: input.id } });
          if (existingBranch) {
            throw new Error("Branch code must be unique. This code already exists.");
          }
        }
        
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.code) updateData.code = input.code;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.pincodeAreaId) updateData.pincodeAreaId = new (mongoose.Types.ObjectId as any)(input.pincodeAreaId);
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.email !== undefined) updateData.email = input.email;
        if (input.managerId !== undefined) updateData.managerId = input.managerId ? new (mongoose.Types.ObjectId as any)(input.managerId) : undefined;
        if (input.changeReason !== undefined) updateData.changeReason = input.changeReason;

        const branch = await Branch.findByIdAndUpdate(input.id, updateData, { new: true }).lean();
        if (!branch) {
          throw new Error("Branch not found");
        }

        return { success: true, branch: { ...branch, id: branch._id.toString(), managerId: branch.managerId?.toString(), pincodeAreaId: branch.pincodeAreaId?.toString() } };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      const result = await Branch.findByIdAndDelete(input.id);
      if (!result) {
        throw new Error("Branch not found");
      }
      return { success: true };
    }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const branch = await Branch.findById(input.id).lean();
      if (!branch) {
        throw new Error("Branch not found");
      }
      return { ...branch, id: branch._id.toString(), managerId: branch.managerId?.toString(), pincodeAreaId: branch.pincodeAreaId?.toString() };
    }),
  }),

  warehouse: router({
    scanQr: publicProcedure
      .input(z.object({ barcode: z.string() }))
      .mutation(async ({ input }) => {
        const binLocation = `Rack Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(
          10 + Math.random() * 50
        )}`;
        return {
          success: true,
          barcode: input.barcode,
          binLocation,
          status: "Verified Inbound & Rack Slot Allocated",
        };
      }),
  }),

  manifests: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await TripManifest.find().sort({ createdAt: -1 }).lean();
        return list.map((item: any) => ({
          ...item,
          id: item._id.toString(),
          vehicleId: item.vehicleId?.toString(),
          driverId: item.driverId?.toString(),
          branchId: item.branchId?.toString(),
          shipmentIds: (item.shipmentIds || []).map((sid: mongoose.Types.ObjectId) => sid.toString()),
        })) as any[];
      } catch {
        return [];
      }
    }),

    create: publicProcedure
      .input(
        z.object({
          manifestNumber: z.string().min(1),
          tripNumber: z.string().min(1),
          vehicleId: z.string().min(1),
          driverId: z.string().min(1),
          branchId: z.string().min(1),
          origin: z.string().min(1),
          destination: z.string().min(1),
          scheduledStart: z.string(),
          scheduledEnd: z.string(),
          notes: z.string().optional(),
          shipmentIds: z.array(z.string()).optional(),
          totalWeight: z.string().optional(),
          totalValue: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const manifest = new TripManifest({
          manifestNumber: input.manifestNumber,
          tripNumber: input.tripNumber,
          vehicleId: new (mongoose.Types.ObjectId as any)(input.vehicleId),
          driverId: new (mongoose.Types.ObjectId as any)(input.driverId),
          branchId: new (mongoose.Types.ObjectId as any)(input.branchId),
          origin: input.origin,
          destination: input.destination,
          scheduledStart: new Date(input.scheduledStart),
          scheduledEnd: new Date(input.scheduledEnd),
          status: "planned",
          shipmentIds: (input.shipmentIds || []).map((sid) => new (mongoose.Types.ObjectId as any)(sid)),
          totalWeight: input.totalWeight || "",
          totalValue: input.totalValue || "",
          notes: input.notes,
        });

        await manifest.save();

        return { success: true, manifest: { ...manifest.toObject(), id: manifest._id.toString() } };
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          manifestNumber: z.string().min(1).optional(),
          tripNumber: z.string().min(1).optional(),
          vehicleId: z.string().optional(),
          driverId: z.string().optional(),
          branchId: z.string().optional(),
          origin: z.string().optional(),
          destination: z.string().optional(),
          scheduledStart: z.string().optional(),
          scheduledEnd: z.string().optional(),
          status: z.string().optional(),
          notes: z.string().optional(),
          shipmentIds: z.array(z.string()).optional(),
          totalWeight: z.string().optional(),
          totalValue: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const manifestUpdate: any = {};

        if (updateData.manifestNumber) manifestUpdate.manifestNumber = updateData.manifestNumber;
        if (updateData.tripNumber) manifestUpdate.tripNumber = updateData.tripNumber;
        if (updateData.vehicleId) manifestUpdate.vehicleId = new (mongoose.Types.ObjectId as any)(updateData.vehicleId);
        if (updateData.driverId) manifestUpdate.driverId = new (mongoose.Types.ObjectId as any)(updateData.driverId);
        if (updateData.branchId) manifestUpdate.branchId = new (mongoose.Types.ObjectId as any)(updateData.branchId);
        if (updateData.origin) manifestUpdate.origin = updateData.origin;
        if (updateData.destination) manifestUpdate.destination = updateData.destination;
        if (updateData.scheduledStart) manifestUpdate.scheduledStart = new Date(updateData.scheduledStart);
        if (updateData.scheduledEnd) manifestUpdate.scheduledEnd = new Date(updateData.scheduledEnd);
        if (updateData.status) manifestUpdate.status = updateData.status;
        if (updateData.notes !== undefined) manifestUpdate.notes = updateData.notes;
        if (updateData.totalWeight !== undefined) manifestUpdate.totalWeight = updateData.totalWeight;
        if (updateData.totalValue !== undefined) manifestUpdate.totalValue = updateData.totalValue;
        if (updateData.shipmentIds) {
          manifestUpdate.shipmentIds = updateData.shipmentIds.map((sid) => new (mongoose.Types.ObjectId as any)(sid));
        }

        const manifest = await TripManifest.findByIdAndUpdate(id, manifestUpdate, { new: true }).lean();
        if (!manifest) {
          throw new Error("Manifest not found");
        }

        return {
          success: true,
          manifest: {
            ...manifest,
            id: manifest._id.toString(),
            vehicleId: manifest.vehicleId?.toString(),
            driverId: manifest.driverId?.toString(),
            branchId: manifest.branchId?.toString(),
            shipmentIds: (manifest.shipmentIds || []).map((sid: mongoose.Types.ObjectId) => sid.toString()),
          },
        };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      const result = await TripManifest.findByIdAndDelete(input.id);
      if (!result) {
        throw new Error("Manifest not found");
      }
      return { success: true };
    }),
  }),

  pincodes: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await PincodeArea.find().sort({ _id: -1 }).lean();
        return list.map((item: any) => ({ ...item, id: item._id.toString() }));
      } catch {
        return [];
      }
    }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          state: z.string().min(1),
          city: z.string().min(1),
          pincode: z.string().min(1),
          country: z.string().default("India"),
          branchName: z.string().optional(),
          branchAddress: z.string().optional(),
          branchCode: z.string().optional(),
          branchState: z.string().optional(),
          branchCity: z.string().optional(),
          branchCountry: z.string().optional(),
          branchRegion: z.string().optional(),
          branchZone: z.string().optional(),
          branchDivision: z.string().optional(),
          branchDepartment: z.string().optional(),
          branchSection: z.string().optional(),
          branchUnit: z.string().optional(),
          branchTeam: z.string().optional(),
          branchGroup: z.string().optional(),
          branchCategory: z.string().optional(),
          branchType: z.string().optional(),
          branchStatus: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const pincodeArea = new PincodeArea({
          name: input.name,
          state: input.state,
          city: input.city,
          pincode: input.pincode,
          country: input.country,
          branchName: input.branchName,
          branchAddress: input.branchAddress,
          branchCode: input.branchCode,
          branchState: input.branchState,
          branchCity: input.branchCity,
          branchCountry: input.branchCountry,
          branchRegion: input.branchRegion,
          branchZone: input.branchZone,
          branchDivision: input.branchDivision,
          branchDepartment: input.branchDepartment,
          branchSection: input.branchSection,
          branchUnit: input.branchUnit,
          branchTeam: input.branchTeam,
          branchGroup: input.branchGroup,
          branchCategory: input.branchCategory,
          branchType: input.branchType,
          branchStatus: input.branchStatus || "active",
        });

        await pincodeArea.save();

        return { success: true, pincodeArea: { ...pincodeArea.toObject(), id: pincodeArea._id.toString() } };
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          state: z.string().min(1).optional(),
          city: z.string().min(1).optional(),
          pincode: z.string().min(1).optional(),
          country: z.string().optional(),
          branchName: z.string().optional(),
          branchAddress: z.string().optional(),
          branchCode: z.string().optional(),
          branchState: z.string().optional(),
          branchCity: z.string().optional(),
          branchCountry: z.string().optional(),
          branchRegion: z.string().optional(),
          branchZone: z.string().optional(),
          branchDivision: z.string().optional(),
          branchDepartment: z.string().optional(),
          branchSection: z.string().optional(),
          branchUnit: z.string().optional(),
          branchTeam: z.string().optional(),
          branchGroup: z.string().optional(),
          branchCategory: z.string().optional(),
          branchType: z.string().optional(),
          branchStatus: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.state) updateData.state = input.state;
        if (input.city) updateData.city = input.city;
        if (input.pincode) updateData.pincode = input.pincode;
        if (input.country) updateData.country = input.country;
        if (input.branchName !== undefined) updateData.branchName = input.branchName;
        if (input.branchAddress !== undefined) updateData.branchAddress = input.branchAddress;
        if (input.branchCode !== undefined) updateData.branchCode = input.branchCode;
        if (input.branchState !== undefined) updateData.branchState = input.branchState;
        if (input.branchCity !== undefined) updateData.branchCity = input.branchCity;
        if (input.branchCountry !== undefined) updateData.branchCountry = input.branchCountry;
        if (input.branchRegion !== undefined) updateData.branchRegion = input.branchRegion;
        if (input.branchZone !== undefined) updateData.branchZone = input.branchZone;
        if (input.branchDivision !== undefined) updateData.branchDivision = input.branchDivision;
        if (input.branchDepartment !== undefined) updateData.branchDepartment = input.branchDepartment;
        if (input.branchSection !== undefined) updateData.branchSection = input.branchSection;
        if (input.branchUnit !== undefined) updateData.branchUnit = input.branchUnit;
        if (input.branchTeam !== undefined) updateData.branchTeam = input.branchTeam;
        if (input.branchGroup !== undefined) updateData.branchGroup = input.branchGroup;
        if (input.branchCategory !== undefined) updateData.branchCategory = input.branchCategory;
        if (input.branchType !== undefined) updateData.branchType = input.branchType;
        if (input.branchStatus !== undefined) updateData.branchStatus = input.branchStatus;

        const pincodeArea = await PincodeArea.findByIdAndUpdate(input.id, updateData, { new: true }).lean();
        if (!pincodeArea) {
          throw new Error("Pincode Area not found");
        }

        return { success: true, pincodeArea: { ...pincodeArea, id: pincodeArea._id.toString() } };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      const result = await PincodeArea.findByIdAndDelete(input.id);
      if (!result) {
        throw new Error("Pincode Area not found");
      }
      return { success: true };
    }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const pincodeArea = await PincodeArea.findById(input.id).lean();
      if (!pincodeArea) {
        throw new Error("Pincode Area not found");
      }
      return { ...pincodeArea, id: pincodeArea._id.toString() };
    }),

    searchByStateCity: publicProcedure
      .input(z.object({ state: z.string().optional(), city: z.string().optional() }))
      .query(async ({ input }) => {
        try {
          const query: any = {};
          if (input.state) query.state = { $regex: input.state, $options: "i" };
          if (input.city) query.city = { $regex: input.city, $options: "i" };
          const list = await PincodeArea.find(query).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByName: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ name: { $regex: input.name, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByContact: publicProcedure
      .input(z.object({ contact: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({
            $or: [
              { phone: { $regex: input.contact, $options: "i" } },
            ]
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByEmail: publicProcedure
      .input(z.object({ email: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({
            email: { $regex: input.email, $options: "i" }
          }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCode: publicProcedure
      .input(z.object({ branchCode: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchCode: { $regex: input.branchCode, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchName: publicProcedure
      .input(z.object({ branchName: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchName: { $regex: input.branchName, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchAddress: publicProcedure
      .input(z.object({ branchAddress: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchAddress: { $regex: input.branchAddress, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchPincodeArea: publicProcedure
      .input(z.object({ pincode: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ pincode: { $regex: input.pincode, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchState: publicProcedure
      .input(z.object({ branchState: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchState: { $regex: input.branchState, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCity: publicProcedure
      .input(z.object({ branchCity: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchCity: { $regex: input.branchCity, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCountry: publicProcedure
      .input(z.object({ branchCountry: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchCountry: { $regex: input.branchCountry, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchRegion: publicProcedure
      .input(z.object({ branchRegion: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchRegion: { $regex: input.branchRegion, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchZone: publicProcedure
      .input(z.object({ branchZone: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchZone: { $regex: input.branchZone, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchDivision: publicProcedure
      .input(z.object({ branchDivision: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchDivision: { $regex: input.branchDivision, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchDepartment: publicProcedure
      .input(z.object({ branchDepartment: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchDepartment: { $regex: input.branchDepartment, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchSection: publicProcedure
      .input(z.object({ branchSection: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchSection: { $regex: input.branchSection, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchUnit: publicProcedure
      .input(z.object({ branchUnit: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchUnit: { $regex: input.branchUnit, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchTeam: publicProcedure
      .input(z.object({ branchTeam: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchTeam: { $regex: input.branchTeam, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchGroup: publicProcedure
      .input(z.object({ branchGroup: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchGroup: { $regex: input.branchGroup, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchCategory: publicProcedure
      .input(z.object({ branchCategory: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchCategory: { $regex: input.branchCategory, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchType: publicProcedure
      .input(z.object({ branchType: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchType: { $regex: input.branchType, $options: "i" } }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),

    searchByBranchStatus: publicProcedure
      .input(z.object({ branchStatus: z.string() }))
      .query(async ({ input }) => {
        try {
          const list = await PincodeArea.find({ branchStatus: input.branchStatus }).lean();
          return list.map((item: any) => ({ ...item, id: item._id.toString() }));
        } catch {
          return [];
        }
      }),
  }),

  notifications: router({
    list: publicProcedure.query(async () => {
      try {
        const list = await Notification.find().sort({ _id: -1 }).limit(10).lean();
        return list.map((item: any) => ({ ...item, id: item._id.toString(), userId: item.userId?.toString() }));
      } catch {
        return [];
      }
    }),
  }),

  geo: geoRouter,
});

export type AppRouter = typeof appRouter;

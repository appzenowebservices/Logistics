import mongoose from "mongoose";
import { connectDB } from "@/db";
import {
  User,
  Branch,
  Vehicle,
  Shipment,
  Notification,
  CompanyProfile,
  RateCard,
  RateContract,
  TripManifest,
  POD,
  IoTTelemetry,
  FASTagTransaction,
  MaintenanceLog,
  DriverCompliance,
  Attendance,
  Payroll,
  Invoice,
  TDSRecord,
  VendorPayout,
  AuditLog,
  RolePermission,
  IntegrationConfig,
  ContactInquiry,
  NewsletterSubscription,
  Report,
  BinLocation,
  StockMovement,
  Client,
  Lead,
  SupportTicket,
  WarehouseTask,
  PincodeArea,
} from "@/db/schema";

export interface DemoUser {
  name: string;
  email: string;
  password: string;
  role: string;
  roleTitle: string;
  department: string;
  phone?: string;
}

export const DEMO_USERS: DemoUser[] = [
  { name: "Aditya Sharma", email: "superadmin@alms.com", password: "password123", role: "super_admin", roleTitle: "Super Admin (Founder)", department: "Executive", phone: "+91-11-00000001" },
  { name: "Rajesh Verma", email: "admin@alms.com", password: "password123", role: "admin", roleTitle: "System Admin", department: "IT & Ops", phone: "+91-11-00000002" },
  { name: "Vikram Malhotra", email: "regional@alms.com", password: "password123", role: "regional_manager", roleTitle: "Regional Manager (North)", department: "Operations", phone: "+91-11-00000003" },
  { name: "Sneha Nair", email: "branch@alms.com", password: "password123", role: "branch_manager", roleTitle: "Branch Manager (Mumbai)", department: "Branch Operations", phone: "+91-22-00000004" },
  { name: "Amit Kumar", email: "dispatcher@alms.com", password: "password123", role: "dispatcher", roleTitle: "Chief Dispatcher", department: "Dispatch", phone: "+91-11-00000005" },
  { name: "Manoj Singh", email: "warehouse@alms.com", password: "password123", role: "warehouse_manager", roleTitle: "Warehouse Manager", department: "Warehousing", phone: "+91-22-00000006" },
  { name: "Suresh Rao", email: "fleet@alms.com", password: "password123", role: "fleet_manager", roleTitle: "Fleet Manager", department: "Fleet & Maintenance", phone: "+91-80-00000007" },
  { name: "Gurpreet Singh", email: "driver@alms.com", password: "password123", role: "driver", roleTitle: "Senior Fleet Driver", department: "Transport", phone: "+91-9876543210" },
  { name: "Reliance Retail Ltd", email: "customer@alms.com", password: "password123", role: "customer", roleTitle: "Corporate Client", department: "Client Accounts", phone: "+91-22-00000009" },
  { name: "Ashok Fuel & Tyres", email: "vendor@alms.com", password: "password123", role: "vendor", roleTitle: "Fuel & Tyre Vendor", department: "Vendors", phone: "+91-80-00000010" },
  { name: "Priya Das", email: "accountant@alms.com", password: "password123", role: "accountant", roleTitle: "Senior Accountant", department: "Finance & Accounts", phone: "+91-11-00000011" },
  { name: "Divya Kapoor", email: "hr@alms.com", password: "password123", role: "hr", roleTitle: "HR Executive", department: "Human Resources", phone: "+91-11-00000012" },
  { name: "Rohit Bansal", email: "crm@alms.com", password: "password123", role: "crm_executive", roleTitle: "CRM Executive", department: "Sales & CRM", phone: "+91-80-00000013" },
  { name: "Neha Gupta", email: "support@alms.com", password: "password123", role: "support_executive", roleTitle: "Customer Support Lead", department: "Support", phone: "+91-11-00000014" },
  { name: "Bahadur Thapa", email: "security@alms.com", password: "password123", role: "security_guard", roleTitle: "Gate Security Guard", department: "Security & Access", phone: "+91-80-00000015" },
  { name: "Siddharth Mehta", email: "cxo@alms.com", password: "password123", role: "executive_management", roleTitle: "Chief Operating Officer (COO)", department: "Executive Board", phone: "+91-11-00000016" },
];

const MODEL_NAMES = [
  "User",
  "Branch",
  "Vehicle",
  "Shipment",
  "Notification",
  "CompanyProfile",
  "RateCard",
  "RateContract",
  "TripManifest",
  "POD",
  "IoTTelemetry",
  "FASTagTransaction",
  "MaintenanceLog",
  "DriverCompliance",
  "Attendance",
  "Payroll",
  "Invoice",
  "TDSRecord",
  "VendorPayout",
  "AuditLog",
  "RolePermission",
  "IntegrationConfig",
  "ContactInquiry",
  "NewsletterSubscription",
  "Report",
  "BinLocation",
  "StockMovement",
  "Client",
  "Lead",
  "SupportTicket",
  "WarehouseTask",
  "PincodeArea",
];

export async function flushDatabase() {
  for (const name of MODEL_NAMES) {
    try {
      const model = mongoose.models[name];
      if (model) {
        await model.deleteMany({}, { maxTimeMS: 30000 });
      }
    } catch (e) {
      console.error(`Failed to drop collection for ${name}:`, e);
    }
  }
}

async function safeInsertMany(model: any, docs: any[]) {
  try {
    return await model.insertMany(docs);
  } catch (e: any) {
    if (e.code === 11000) {
      return await model.find({}).lean();
    }
    throw e;
  }
}

export async function seedDatabase(opts?: { force?: boolean }) {
  try {
    await connectDB();

    if (!opts?.force) {
      try {
        const existingUsers = await User.countDocuments().exec();
        if (existingUsers > 0) {
          return { success: true, message: "Database already seeded, skipping.", collections: MODEL_NAMES };
        }
      } catch {
        // fall through to seed on count failure
      }
    }

    await flushDatabase();

    await safeInsertMany(CompanyProfile, [
      {
        name: "ADDies Logistics Management System",
        legalName: "ADDies Logistics Pvt Ltd",
        gstin: "07AABCU9603R1ZM",
        pan: "AABCU9603R",
        address: "NH-8, Mahipalpur Logistics Park",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110037",
        phone: "+91-11-23456789",
        email: "corporate@alms.com",
        website: "https://addieslogistics.com",
        financialYearStart: "04-01",
        currency: "INR",
        timezone: "Asia/Kolkata",
      },
    ]);

    const createdPincodes = await safeInsertMany(PincodeArea, [
      { name: "Mahipalpur", state: "Delhi", city: "New Delhi", pincode: "110037", country: "India", branchName: "Delhi National Hub", branchStatus: "active" },
      { name: "Bhiwandi", state: "Maharashtra", city: "Mumbai", pincode: "421302", country: "India", branchName: "Mumbai Western Port Hub", branchStatus: "active" },
      { name: "Electronic City", state: "Karnataka", city: "Bangalore", pincode: "560100", country: "India", branchName: "Bangalore Tech Hub", branchStatus: "active" },
    ]);

    const pincodeIds = createdPincodes.map((p: any) => p._id || p);

    const createdBranches = await safeInsertMany(Branch, [
      { name: "Delhi National Hub", code: "DEL-HUB-01", address: "NH-8, Mahipalpur Logistics Park", pincodeAreaId: pincodeIds[0], phone: "+91-11-23456789", email: "delhi@alms.com" },
      { name: "Mumbai Western Port Hub", code: "MUM-HUB-02", address: "Bhiwandi Warehousing Complex", pincodeAreaId: pincodeIds[1], phone: "+91-22-87654321", email: "mumbai@alms.com" },
      { name: "Bangalore Tech Hub", code: "BLR-HUB-03", address: "Electronic City Phase 2", pincodeAreaId: pincodeIds[2], phone: "+91-80-33445566", email: "blr@alms.com" },
    ]);

    const branchIds = createdBranches.map((b: any) => b._id || b);

    const usersWithBranch = DEMO_USERS.map((u, idx) => ({
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      branchId: branchIds[idx % branchIds.length],
      phone: u.phone,
      isActive: true,
    }));

    const insertedUsers = await safeInsertMany(User, usersWithBranch);

    const driverUser = insertedUsers.find((u: any) => u.role === "driver") || insertedUsers[0];
    const customerUser = insertedUsers.find((u: any) => u.role === "customer") || insertedUsers[0];
    const fleetUser = insertedUsers.find((u: any) => u.role === "fleet_manager") || insertedUsers[0];
    const warehouseUser = insertedUsers.find((u: any) => u.role === "warehouse_manager") || insertedUsers[0];

    await safeInsertMany(Vehicle, [
      { registrationNumber: "DL-01-AB-1234", type: "Container (40ft)", model: "Tata Prima 4928.S", capacity: "28.50", status: "in_transit", driverId: driverUser._id || driverUser, branchId: branchIds[0], gpsDeviceId: "GPS-IOT-9901", lastMaintenance: new Date("2026-06-15"), insuranceExpiry: new Date("2027-03-01") },
      { registrationNumber: "MH-04-XY-9876", type: "Mini Truck", model: "Mahindra Bolero Pickup", capacity: "1.75", status: "available", driverId: null, branchId: branchIds[1], gpsDeviceId: "GPS-IOT-9902", lastMaintenance: new Date("2026-05-20"), insuranceExpiry: new Date("2026-12-15") },
      { registrationNumber: "KA-05-MN-4567", type: "Refrigerated Van", model: "Ashok Leyland Dost", capacity: "3.50", status: "available", driverId: null, branchId: branchIds[2], gpsDeviceId: "GPS-IOT-9903", lastMaintenance: new Date("2026-07-01"), insuranceExpiry: new Date("2027-01-20") },
      { registrationNumber: "HR-38-KL-7788", type: "Heavy Trailer", model: "BharatBenz 5528T", capacity: "40.00", status: "maintenance", driverId: null, branchId: branchIds[0], gpsDeviceId: "GPS-IOT-9904", lastMaintenance: new Date("2026-06-30"), insuranceExpiry: new Date("2026-11-10") },
    ]);

    const allVehicles = await Vehicle.find({}).lean();
    const vehicleMap: Record<string, any> = {};
    for (const v of allVehicles) {
      vehicleMap[v.registrationNumber] = v;
    }

    const v1 = vehicleMap["DL-01-AB-1234"];
    const v2 = vehicleMap["MH-04-XY-9876"];
    const v3 = vehicleMap["KA-05-MN-4567"];
    const v4 = vehicleMap["HR-38-KL-7788"];

    await safeInsertMany(Shipment, [
      { trackingNumber: "ALMS-8839210", customerId: customerUser._id || customerUser, origin: "New Delhi (DEL-HUB-01)", destination: "Mumbai (MUM-HUB-02)", status: "in_transit", vehicleId: v1._id, driverId: driverUser._id || driverUser, weight: "18.40", value: "1450000.00", createdAt: new Date("2026-07-01") },
      { trackingNumber: "ALMS-9940312", customerId: customerUser._id || customerUser, origin: "Mumbai (MUM-HUB-02)", destination: "Pune Logistics Yard", status: "booked", vehicleId: v2._id, driverId: null, weight: "1.20", value: "85000.00", createdAt: new Date("2026-07-02") },
      { trackingNumber: "ALMS-7712349", customerId: customerUser._id || customerUser, origin: "Bangalore Tech Hub", destination: "Chennai Port", status: "delivered", vehicleId: v3._id, driverId: driverUser._id || driverUser, weight: "2.80", value: "430000.00", createdAt: new Date("2026-06-28") },
      { trackingNumber: "ALMS-5539021", customerId: customerUser._id || customerUser, origin: "Hyderabad Depot", destination: "Delhi National Hub", status: "dispatched", vehicleId: v1._id, driverId: driverUser._id || driverUser, weight: "14.00", value: "920000.00", createdAt: new Date("2026-07-03") },
    ]);

    const allShipments = await Shipment.find({}).lean();
    const shipmentMap: Record<string, any> = {};
    for (const s of allShipments) {
      shipmentMap[s.trackingNumber] = s;
    }

    const adminUser = insertedUsers[0];
    await safeInsertMany(Notification, [
      { userId: adminUser._id || adminUser, title: "ETA Alert: Harsh Braking Detected", message: "Vehicle DL-01-AB-1234 reported harsh deceleration on NH-8 near Jaipur.", type: "alert", read: false },
      { userId: adminUser._id || adminUser, title: "FASTag Balance Low", message: "Fleet Account FASTag wallet balance dropped below ₹5,000 threshold.", type: "alert", read: false },
      { userId: adminUser._id || adminUser, title: "New Booking Order #ALMS-9940312", message: "Reliance Retail placed a priority express booking.", type: "success", read: false },
    ]);

    await safeInsertMany(RateCard, [
      { name: "Delhi-Mumbai Container Rate", vehicleType: "Container (40ft)", origin: "Delhi", destination: "Mumbai", baseRatePerKm: 32, fuelSurchargePercent: 12, fragileHandlingCharge: 4500, temperatureControlCharge: 8000, gstPercent: 5, minWeight: "10", maxWeight: "30", effectiveFrom: new Date("2026-04-01") },
      { name: "Mumbai-Pune Mini Truck Rate", vehicleType: "Mini Truck", origin: "Mumbai", destination: "Pune", baseRatePerKm: 22, fuelSurchargePercent: 10, fragileHandlingCharge: 1500, temperatureControlCharge: 0, gstPercent: 5, minWeight: "0.5", maxWeight: "2", effectiveFrom: new Date("2026-04-01") },
      { name: "Bangalore-Chennai Reefer Rate", vehicleType: "Refrigerated Van", origin: "Bangalore", destination: "Chennai", baseRatePerKm: 28, fuelSurchargePercent: 11, fragileHandlingCharge: 3500, temperatureControlCharge: 6000, gstPercent: 5, minWeight: "1", maxWeight: "5", effectiveFrom: new Date("2026-04-01") },
    ]);

    const relianceClient = await safeInsertMany(Client, [
      { name: "Reliance Retail Pvt Ltd", email: "logistics@relianceretail.com", phone: "+91-22-34567890", company: "Reliance Retail Pvt Ltd", gstin: "27AAACR1234R1ZX", address: "Nariman Point, Mumbai", city: "Mumbai", state: "Maharashtra", creditLimit: 2500000, outstandingAmount: 640000, status: "active" },
      { name: "Flipkart Logistics", email: "ops@flipkart.com", phone: "+91-80-45678901", company: "Flipkart Internet Pvt Ltd", gstin: "29AABCF4567R1ZY", address: "Whitefield, Bangalore", city: "Bangalore", state: "Karnataka", creditLimit: 1800000, outstandingAmount: 320000, status: "active" },
      { name: "Tata Motors Ltd", email: "supply@tatamotors.com", phone: "+91-11-56789012", company: "Tata Motors Ltd", gstin: "27AAACT7890R1ZW", address: "Andheri East, Mumbai", city: "Mumbai", state: "Maharashtra", creditLimit: 3200000, outstandingAmount: 0, status: "active" },
    ]);

    const clientIds = relianceClient.map((c: any) => c._id || c);

    await safeInsertMany(RateContract, [
      { clientId: clientIds[0], clientName: "Reliance Retail Pvt Ltd", contractNumber: "RC-2026-RR-001", startDate: new Date("2026-04-01"), endDate: new Date("2027-03-31"), creditLimit: 2500000, paymentTerms: "Net 30", specialRates: [{ route: "Delhi-Mumbai", ratePerKm: 28 }], gstExempt: false, status: "active" },
      { clientId: clientIds[1], clientName: "Flipkart Logistics", contractNumber: "RC-2026-FL-002", startDate: new Date("2026-05-01"), endDate: new Date("2027-04-30"), creditLimit: 1800000, paymentTerms: "Net 15", specialRates: [{ route: "Bangalore-Chennai", ratePerKm: 24 }], gstExempt: false, status: "active" },
    ]);

    await safeInsertMany(TripManifest, [
      { manifestNumber: "MF-2026-901", tripNumber: "TRP-1092", vehicleId: v1._id, driverId: driverUser._id || driverUser, branchId: branchIds[0], origin: "Delhi", destination: "Mumbai", scheduledStart: new Date("2026-07-01T06:00:00"), scheduledEnd: new Date("2026-07-01T20:00:00"), actualStart: new Date("2026-07-01T06:15:00"), status: "in_transit", shipmentIds: [shipmentMap["ALMS-8839210"]._id], totalWeight: "18.40", totalValue: "1450000.00" },
      { manifestNumber: "MF-2026-902", tripNumber: "TRP-1093", vehicleId: v3._id, driverId: driverUser._id || driverUser, branchId: branchIds[2], origin: "Bangalore", destination: "Chennai", scheduledStart: new Date("2026-06-28T05:00:00"), scheduledEnd: new Date("2026-06-28T18:00:00"), actualEnd: new Date("2026-06-28T17:45:00"), status: "completed", shipmentIds: [shipmentMap["ALMS-7712349"]._id], totalWeight: "2.80", totalValue: "430000.00" },
    ]);

    const manifestIds = (await TripManifest.find({}).lean()).map((m: any) => m._id);

    await safeInsertMany(POD, [
      { shipmentId: shipmentMap["ALMS-7712349"]._id, manifestId: manifestIds[1], consigneeName: "Chennai Port Logistics", consigneePhone: "+91-44-23456789", deliveredAt: new Date("2026-06-28T17:45:00"), receivedBy: "Rajesh Kumar", damageReported: false },
    ]);

    await safeInsertMany(IoTTelemetry, [
      { vehicleId: v1._id, driverId: driverUser._id || driverUser, gpsDeviceId: "GPS-IOT-9901", latitude: 28.6139, longitude: 77.2090, speedKmph: 68, engineRpm: 1850, fuelLevelPercent: 74, temperatureCelsius: 22, harshBraking: true, harshAcceleration: false, overSpeeding: false, location: "NH-8 Highway", recordedAt: new Date("2026-07-04T08:30:00") },
      { vehicleId: v1._id, driverId: driverUser._id || driverUser, gpsDeviceId: "GPS-IOT-9901", latitude: 28.6200, longitude: 77.2200, speedKmph: 72, engineRpm: 1900, fuelLevelPercent: 70, temperatureCelsius: 23, harshBraking: false, harshAcceleration: false, overSpeeding: false, location: "NH-8 Near Jaipur", recordedAt: new Date("2026-07-04T08:45:00") },
      { vehicleId: v3._id, driverId: driverUser._id || driverUser, gpsDeviceId: "GPS-IOT-9903", latitude: 12.9716, longitude: 77.5946, speedKmph: 55, engineRpm: 1600, fuelLevelPercent: 82, temperatureCelsius: -18, harshBraking: false, harshAcceleration: false, overSpeeding: false, location: "Bangalore Tech Hub", recordedAt: new Date("2026-07-04T07:00:00") },
    ]);

    await safeInsertMany(FASTagTransaction, [
      { vehicleId: v1._id, tollPlaza: "Delhi-Gurgaon Toll", amount: 235, balanceBefore: 12450, balanceAfter: 12215, transactionType: "debit", transactionDate: new Date("2026-07-01T07:30:00") },
      { vehicleId: v1._id, tollPlaza: "Mumbai-Pune Express", amount: 320, balanceBefore: 12215, balanceAfter: 11895, transactionType: "debit", transactionDate: new Date("2026-07-01T18:00:00") },
      { vehicleId: v2._id, tollPlaza: "Mumbai-Nashik Toll", amount: 140, balanceBefore: 8200, balanceAfter: 8060, transactionType: "debit", transactionDate: new Date("2026-07-02T10:00:00") },
      { vehicleId: v1._id, tollPlaza: "Auto Recharge", amount: 5000, balanceBefore: 11895, balanceAfter: 16895, transactionType: "credit", transactionDate: new Date("2026-07-03T09:00:00") },
    ]);

    await safeInsertMany(MaintenanceLog, [
      { vehicleId: v1._id, maintenanceType: "service", description: "Full service with oil change and brake check", cost: 45000, vendorName: "Tata Motors Service Center", invoiceNumber: "INV-TM-2026-001", nextDueDate: new Date("2026-12-15"), odometerReading: "145000", performedAt: new Date("2026-06-15") },
      { vehicleId: v3._id, maintenanceType: "service", description: "Refrigeration unit calibration and gas top-up", cost: 28000, vendorName: "Ashok Leyland Service", invoiceNumber: "INV-AL-2026-045", nextDueDate: new Date("2026-09-01"), odometerReading: "67000", performedAt: new Date("2026-07-01") },
      { vehicleId: v4._id, maintenanceType: "repair", description: "Engine head gasket replacement", cost: 120000, vendorName: "BharatBenz Service Center", invoiceNumber: "INV-BB-2026-012", nextDueDate: new Date("2026-08-15"), odometerReading: "230000", performedAt: new Date("2026-06-30") },
    ]);

    const driverId = driverUser._id || driverUser;
    const hrUser = insertedUsers.find((u: any) => u.role === "hr") || insertedUsers[0];

    await safeInsertMany(DriverCompliance, [
      { userId: driverId, licenseNumber: "DL-14201100982", licenseIssueDate: new Date("2022-03-15"), licenseExpiryDate: new Date("2042-03-14"), licenseClass: "Heavy Vehicle", policeVerificationStatus: "verified", policeVerificationDate: new Date("2026-01-10"), medicalCheckupStatus: "passed", medicalCheckupDate: new Date("2026-05-20"), emergencyContactName: "Kuldeep Singh", emergencyContactPhone: "+91-9876543211" },
    ]);

    await safeInsertMany(Attendance, [
      { userId: driverId, date: new Date("2026-07-01"), checkIn: new Date("2026-07-01T05:45:00"), checkOut: new Date("2026-07-01T21:00:00"), tripIds: [manifestIds[0]], status: "present", remarks: "Delhi to Mumbai trip" },
      { userId: driverId, date: new Date("2026-07-02"), checkIn: new Date("2026-07-02T06:00:00"), checkOut: new Date("2026-07-02T18:00:00"), tripIds: [], status: "present", remarks: "Local delivery runs" },
      { userId: driverId, date: new Date("2026-07-03"), checkIn: new Date("2026-07-03T05:30:00"), checkOut: new Date("2026-07-03T20:30:00"), tripIds: [manifestIds[1]], status: "present", remarks: "Bangalore to Chennai trip" },
    ]);

    await safeInsertMany(Payroll, [
      { userId: driverId, month: "June", year: 2026, basicSalary: 35000, allowances: 8500, deductions: 2100, netSalary: 40400, tripsCompleted: 22, bonus: 3000, status: "paid", paidAt: new Date("2026-07-01") },
      { userId: hrUser._id || hrUser, month: "June", year: 2026, basicSalary: 45000, allowances: 12000, deductions: 3200, netSalary: 53800, tripsCompleted: 0, bonus: 0, status: "paid", paidAt: new Date("2026-07-01") },
    ]);

    await safeInsertMany(Invoice, [
      { invoiceNumber: "INV-2026-001", clientId: clientIds[0], shipmentIds: [shipmentMap["ALMS-8839210"]._id, shipmentMap["ALMS-5539021"]._id], subtotal: 182000, gstAmount: 9100, tdsAmount: 1820, totalAmount: 190280, dueDate: new Date("2026-07-31"), status: "sent" },
      { invoiceNumber: "INV-2026-002", clientId: clientIds[1], shipmentIds: [shipmentMap["ALMS-9940312"]._id], subtotal: 85000, gstAmount: 4250, tdsAmount: 850, totalAmount: 89400, dueDate: new Date("2026-07-15"), status: "paid", paidAt: new Date("2026-07-10") },
    ]);

    const invoiceIds = (await Invoice.find({}).lean()).map((i: any) => i._id);

    await safeInsertMany(TDSRecord, [
      { invoiceId: invoiceIds[0], clientId: clientIds[0], tdsRate: 10, tdsAmount: 1820, section: "194Q", status: "filed" },
    ]);

    const vendorUser = insertedUsers.find((u: any) => u.role === "vendor") || insertedUsers[0];
    await safeInsertMany(VendorPayout, [
      { vendorId: vendorUser._id || vendorUser, vendorName: "Ashok Fuel & Tyres", invoiceNumber: "VIN-2026-001", amount: 450000, dueDate: new Date("2026-07-15"), status: "pending" },
      { vendorId: vendorUser._id || vendorUser, vendorName: "Ashok Fuel & Tyres", invoiceNumber: "VIN-2026-002", amount: 280000, dueDate: new Date("2026-07-20"), status: "approved" },
    ]);

    await safeInsertMany(AuditLog, [
      { userId: adminUser._id || adminUser, userName: adminUser.name, userRole: adminUser.role, action: "login", module: "auth", ipAddress: "10.102.17.85" },
      { userId: adminUser._id || adminUser, userName: adminUser.name, userRole: adminUser.role, action: "create_booking", module: "bookings", entityType: "Shipment", entityId: shipmentMap["ALMS-8839210"]._id },
      { userId: fleetUser._id || fleetUser, userName: fleetUser.name, userRole: fleetUser.role, action: "update_vehicle_status", module: "fleet", entityType: "Vehicle", entityId: v1._id, newValue: { status: "in_transit" } },
      { userId: warehouseUser._id || warehouseUser, userName: warehouseUser.name, userRole: warehouseUser.role, action: "scan_qr", module: "warehouse", entityType: "WarehouseTask" },
    ]);

    await safeInsertMany(RolePermission, [
      { role: "super_admin", module: "dashboard", permissions: { create: true, read: true, update: true, delete: true, approve: true, export: true } },
      { role: "super_admin", module: "bookings", permissions: { create: true, read: true, update: true, delete: true, approve: true, export: true } },
      { role: "super_admin", module: "fleet", permissions: { create: true, read: true, update: true, delete: true, approve: true, export: true } },
      { role: "admin", module: "dashboard", permissions: { create: true, read: true, update: true, delete: false, approve: true, export: true } },
      { role: "admin", module: "bookings", permissions: { create: true, read: true, update: true, delete: false, approve: true, export: true } },
      { role: "dispatcher", module: "bookings", permissions: { create: true, read: true, update: true, delete: false, approve: false, export: false } },
      { role: "fleet_manager", module: "fleet", permissions: { create: true, read: true, update: true, delete: true, approve: false, export: true } },
      { role: "warehouse_manager", module: "warehouse", permissions: { create: true, read: true, update: true, delete: true, approve: false, export: true } },
      { role: "driver", module: "dashboard", permissions: { create: false, read: true, update: false, delete: false, approve: false, export: false } },
      { role: "customer", module: "bookings", permissions: { create: true, read: true, update: false, delete: false, approve: false, export: false } },
      { role: "accountant", module: "finance", permissions: { create: true, read: true, update: true, delete: false, approve: true, export: true } },
      { role: "hr", module: "drivers", permissions: { create: true, read: true, update: true, delete: false, approve: false, export: true } },
      { role: "crm_executive", module: "crm", permissions: { create: true, read: true, update: true, delete: false, approve: true, export: false } },
      { role: "support_executive", module: "notifications", permissions: { create: true, read: true, update: true, delete: true, approve: false, export: false } },
    ]);

    await safeInsertMany(IntegrationConfig, [
      { name: "Google Maps API", provider: "Google", endpoint: "https://maps.googleapis.com", isActive: true, lastTestStatus: "success", lastTestedAt: new Date("2026-07-01") },
      { name: "FASTag Gateway", provider: "NPCI", endpoint: "https://fastag.npci.org.in", isActive: true, lastTestStatus: "success", lastTestedAt: new Date("2026-07-01") },
      { name: "SMS Gateway", provider: "MSG91", endpoint: "https://api.msg91.com", isActive: true, lastTestStatus: "success", lastTestedAt: new Date("2026-07-01") },
      { name: "WhatsApp Gateway", provider: "WhatsApp Business API", endpoint: "https://graph.facebook.com", isActive: true, lastTestStatus: "success", lastTestedAt: new Date("2026-07-01") },
      { name: "GST E-Way Bill", provider: "GSTN", endpoint: "https://ewaybill.nic.in", isActive: true, lastTestStatus: "success", lastTestedAt: new Date("2026-07-01") },
      { name: "SAP/Tally Sync", provider: "SAP", endpoint: "https://sap.addieslogistics.com", isActive: true, lastTestStatus: "success", lastTestedAt: new Date("2026-07-01") },
    ]);

    await safeInsertMany(ContactInquiry, [
      { fullName: "Rahul Mehta", email: "rahul@techcorp.com", phone: "+91-9876543210", company: "TechCorp Industries", subject: "Corporate Freight Rate Agreement", message: "We require monthly 15-20 FTL loads from Delhi to Mumbai. Please share a customized rate card.", status: "new" },
      { fullName: "Anjali Patel", email: "anjali@healthcareplus.in", phone: "+91-9812345678", company: "Healthcare Plus", subject: "Fleet IoT Hardware Integration", message: "Interested in installing GPS tracking and temperature sensors on our 12 refrigerated vans.", status: "in_progress" },
      { fullName: "Vikram Joshi", email: "vikram@startup.io", phone: "+91-9765432109", company: "StartUp IO", subject: "RBAC Portal Access Issue", message: "Unable to assign dispatcher role to new team members. Please assist.", status: "resolved" },
    ]);

    await safeInsertMany(NewsletterSubscription, [
      { email: "rahul@techcorp.com", name: "Rahul Mehta", company: "TechCorp Industries", isActive: true },
      { email: "anjali@healthcareplus.in", name: "Anjali Patel", company: "Healthcare Plus", isActive: true },
    ]);

    await safeInsertMany(Report, [
      { name: "Pan-India Daily Revenue & Margin Report", category: "Financial", description: "Daily revenue, margin, and collection summary across all hubs", format: "excel", isScheduled: true, scheduleCron: "0 8 * * *", createdAt: new Date("2026-06-01") },
      { name: "Vehicle Idle Time & Fuel Efficiency Log", category: "Fleet IoT", description: "Idle time, fuel consumption, and efficiency metrics for all vehicles", format: "pdf", isScheduled: true, scheduleCron: "0 7 * * 1", createdAt: new Date("2026-06-01") },
      { name: "Driver Trip Attendance & Performance", category: "HR / Drivers", description: "Driver attendance, trip count, and safety ratings", format: "excel", isScheduled: false, createdAt: new Date("2026-06-01") },
      { name: "Warehouse Bin Occupancy & Turnaround", category: "Warehousing", description: "Bin utilization, inbound/outbound volumes, and cycle times", format: "csv", isScheduled: true, scheduleCron: "0 6 * * *", createdAt: new Date("2026-06-01") },
    ]);

    const binLocations = await safeInsertMany(BinLocation, [
      { branchId: branchIds[0], zone: "A", rack: "01", shelf: "1", binCode: "A-01-1", capacity: 50, currentOccupancy: 42, category: "Electronics", isActive: true },
      { branchId: branchIds[0], zone: "A", rack: "01", shelf: "2", binCode: "A-01-2", capacity: 50, currentOccupancy: 38, category: "Electronics", isActive: true },
      { branchId: branchIds[0], zone: "B", rack: "03", shelf: "1", binCode: "B-03-1", capacity: 30, currentOccupancy: 27, category: "Pharma", isActive: true },
      { branchId: branchIds[1], zone: "C", rack: "02", shelf: "1", binCode: "C-02-1", capacity: 40, currentOccupancy: 35, category: "FMCG", isActive: true },
      { branchId: branchIds[2], zone: "D", rack: "01", shelf: "1", binCode: "D-01-1", capacity: 60, currentOccupancy: 50, category: "Automotive", isActive: true },
    ]);

    const binIds = binLocations.map((b: any) => b._id || b);

    await safeInsertMany(StockMovement, [
      { shipmentId: shipmentMap["ALMS-8839210"]._id, binId: binIds[0], movementType: "inbound", quantity: 120, referenceNumber: "PO-2026-001", performedBy: warehouseUser._id || warehouseUser, remarks: "Inbound for Delhi-Mumbai manifest" },
      { shipmentId: shipmentMap["ALMS-9940312"]._id, binId: binIds[3], movementType: "inbound", quantity: 45, referenceNumber: "PO-2026-002", performedBy: warehouseUser._id || warehouseUser, remarks: "Inbound for Mumbai-Pune manifest" },
      { shipmentId: shipmentMap["ALMS-7712349"]._id, binId: binIds[4], movementType: "outbound", quantity: 80, referenceNumber: "PO-2026-003", performedBy: warehouseUser._id || warehouseUser, remarks: "Outbound for Bangalore-Chennai manifest" },
    ]);

    await safeInsertMany(Lead, [
      { name: "Rahul Mehta", email: "rahul@techcorp.com", phone: "+91-9876543210", company: "TechCorp Industries", source: "Website Contact Form", status: "new", expectedRevenue: 5000000 },
      { name: "Anjali Patel", email: "anjali@healthcareplus.in", phone: "+91-9812345678", company: "Healthcare Plus", source: "Inbound Inquiry", status: "contacted", expectedRevenue: 3000000 },
      { name: "Vikram Singh", email: "vikram@logisticspro.com", phone: "+91-9765432109", company: "LogisticsPro", source: "Referral", status: "qualified", expectedRevenue: 8000000 },
    ]);

    const supportUser = insertedUsers.find((u: any) => u.role === "support_executive") || insertedUsers[0];

    await safeInsertMany(SupportTicket, [
      { ticketNumber: "TK-2026-001", subject: "RBAC Portal Access Issue", description: "Unable to assign dispatcher role to new team members.", raisedBy: supportUser._id || supportUser, priority: "medium", status: "resolved", assignedTo: adminUser._id || adminUser, resolution: "Role permissions updated and user notified.", resolvedAt: new Date("2026-07-03") },
      { ticketNumber: "TK-2026-002", subject: "Vehicle GPS Signal Lost", description: "GPS-IOT-9904 on HR-38-KL-7788 is offline since yesterday.", raisedBy: fleetUser._id || fleetUser, priority: "high", status: "open" },
      { ticketNumber: "TK-2026-003", subject: "Invoice Payment Discrepancy", description: "Payment for INV-2026-002 not reflecting in client ledger.", raisedBy: adminUser._id || adminUser, priority: "medium", status: "in_progress", assignedTo: hrUser._id || hrUser },
    ]);

    await safeInsertMany(WarehouseTask, [
      { branchId: branchIds[0], taskType: "pick", assignedTo: warehouseUser._id || warehouseUser, status: "completed", binIds: [binIds[0]], shipmentIds: [shipmentMap["ALMS-8839210"]._id], completedAt: new Date("2026-07-01T10:00:00"), remarks: "Picked and dispatched" },
      { branchId: branchIds[1], taskType: "pack", assignedTo: warehouseUser._id || warehouseUser, status: "in_progress", binIds: [binIds[3]], shipmentIds: [shipmentMap["ALMS-9940312"]._id], remarks: "Packing in progress" },
      { branchId: branchIds[2], taskType: "cycle_count", assignedTo: warehouseUser._id || warehouseUser, status: "pending", binIds: [binIds[4]], shipmentIds: [] },
    ]);

    return { success: true, message: "Seeded full project data successfully!", collections: MODEL_NAMES };
  } catch (error) {
    console.error("Seed error:", error);
    return { success: false, error: String(error) };
  }
}

import mongoose, { Schema, Model } from "mongoose";

export const ROLES_LIST = [
  "super_admin",
  "admin",
  "regional_manager",
  "branch_manager",
  "dispatcher",
  "warehouse_manager",
  "fleet_manager",
  "driver",
  "customer",
  "vendor",
  "accountant",
  "hr",
  "crm_executive",
  "support_executive",
  "security_guard",
  "executive_management",
] as const;

export type UserRole = (typeof ROLES_LIST)[number];

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  pincodeAreaId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  phone?: string;
  isActive: boolean;
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBranch {
  _id?: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address?: string;
  pincodeAreaId: mongoose.Types.ObjectId;
  phone?: string;
  email?: string;
  managerId?: mongoose.Types.ObjectId;
  changeReason?: string;
  lat?: number;
  lng?: number;
  createdAt: Date;
}

export interface IVehicle {
  _id?: mongoose.Types.ObjectId;
  registrationNumber: string;
  type: string;
  model: string;
  capacity?: string;
  status: string;
  driverId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  gpsDeviceId?: string;
  lastMaintenance?: Date;
  insuranceExpiry?: Date;
  lat?: number;
  lng?: number;
  createdAt: Date;
}

export interface IWarehouse {
  _id?: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address?: string;
  pincodeAreaId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  phone?: string;
  email?: string;
  status: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipment {
  _id?: mongoose.Types.ObjectId;
  trackingNumber: string;
  customerId?: mongoose.Types.ObjectId;
  origin: string;
  destination: string;
  status: string;
  vehicleId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  weight?: string;
  value?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: Date;
}

export interface ICompanyProfile {
  _id?: mongoose.Types.ObjectId;
  name: string;
  legalName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  financialYearStart: string;
  currency: string;
  timezone: string;
  lat?: number;
  lng?: number;
  coverageRadius?: number;
  serviceAreas?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRateCard {
  _id?: mongoose.Types.ObjectId;
  name: string;
  vehicleType: string;
  origin: string;
  destination: string;
  baseRatePerKm: number;
  fuelSurchargePercent: number;
  fragileHandlingCharge: number;
  temperatureControlCharge: number;
  gstPercent: number;
  minWeight: string;
  maxWeight: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRateContract {
  _id?: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  creditLimit: number;
  paymentTerms: string;
  specialRates: {
    route: string;
    ratePerKm: number;
  }[];
  gstExempt: boolean;
  status: "draft" | "active" | "expired" | "terminated";
  createdAt: Date;
  updatedAt: Date;
}

export interface ITripManifest {
  _id?: mongoose.Types.ObjectId;
  manifestNumber: string;
  tripNumber: string;
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  origin: string;
  destination: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: "planned" | "dispatched" | "in_transit" | "completed" | "cancelled";
  shipmentIds: mongoose.Types.ObjectId[];
  totalWeight: string;
  totalValue: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPOD {
  _id?: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  manifestId?: mongoose.Types.ObjectId;
  consigneeName: string;
  consigneePhone: string;
  deliveredAt: Date;
  receivedBy: string;
  signatureUrl?: string;
  photoUrl?: string;
  remarks?: string;
  damageReported: boolean;
  damageDescription?: string;
  createdAt: Date;
}

export interface IIoTTelemetry {
  _id?: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  gpsDeviceId: string;
  latitude: number;
  longitude: number;
  speedKmph: number;
  engineRpm: number;
  fuelLevelPercent: number;
  temperatureCelsius?: number;
  harshBraking: boolean;
  harshAcceleration: boolean;
  overSpeeding: boolean;
  location: string;
  recordedAt: Date;
  createdAt: Date;
}

export interface IFASTagTransaction {
  _id?: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  tollPlaza: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionType: "debit" | "credit" | "auto_recharge";
  transactionDate: Date;
  createdAt: Date;
}

export interface IMaintenanceLog {
  _id?: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  maintenanceType: "service" | "repair" | "inspection" | "tyre_change" | "insurance" | "fitness" | "puc";
  description: string;
  cost: number;
  vendorName?: string;
  invoiceNumber?: string;
  nextDueDate?: Date;
  odometerReading?: string;
  performedAt: Date;
  createdAt: Date;
}

export interface IDriverCompliance {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  licenseNumber: string;
  licenseIssueDate: Date;
  licenseExpiryDate: Date;
  licenseClass: string;
  policeVerificationStatus: "pending" | "verified" | "expired";
  policeVerificationDate?: Date;
  medicalCheckupStatus: "pending" | "passed" | "failed";
  medicalCheckupDate?: Date;
  aadharNumber?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  tripIds: mongoose.Types.ObjectId[];
  status: "present" | "absent" | "leave" | "half_day";
  remarks?: string;
  createdAt: Date;
}

export interface IPayroll {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  tripsCompleted: number;
  bonus: number;
  status: "draft" | "processed" | "paid";
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoice {
  _id?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  clientId: mongoose.Types.ObjectId;
  shipmentIds: mongoose.Types.ObjectId[];
  subtotal: number;
  gstAmount: number;
  tdsAmount: number;
  totalAmount: number;
  dueDate: Date;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITDSRecord {
  _id?: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  tdsRate: number;
  tdsAmount: number;
  section: string;
  certificateNumber?: string;
  status: "pending" | "filed" | "received";
  createdAt: Date;
}

export interface IVendorPayout {
  _id?: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  vendorName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "approved" | "paid" | "overdue";
  paidAt?: Date;
  paymentMethod?: string;
  referenceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  userRole?: string;
  action: string;
  module: string;
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IRolePermission {
  _id?: mongoose.Types.ObjectId;
  role: string;
  module: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IIntegrationConfig {
  _id?: mongoose.Types.ObjectId;
  name: string;
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  endpoint: string;
  isActive: boolean;
  lastTestedAt?: Date;
  lastTestStatus?: "success" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactInquiry {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsletterSubscription {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  company?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

export interface IReport {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  query?: any;
  format: "pdf" | "excel" | "csv";
  isScheduled: boolean;
  scheduleCron?: string;
  lastGeneratedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBinLocation {
  _id?: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  zone: string;
  rack: string;
  shelf: string;
  binCode: string;
  capacity: number;
  currentOccupancy: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IStockMovement {
  _id?: mongoose.Types.ObjectId;
  shipmentId?: mongoose.Types.ObjectId;
  binId: mongoose.Types.ObjectId;
  movementType: "inbound" | "outbound" | "transfer" | "adjustment";
  quantity: number;
  referenceNumber?: string;
  performedBy: mongoose.Types.ObjectId;
 remarks?: string;
  createdAt: Date;
}

export interface IClient {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  company: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  creditLimit: number;
  outstandingAmount: number;
  status: "active" | "inactive" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  expectedRevenue?: number;
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportTicket {
  _id?: mongoose.Types.ObjectId;
  ticketNumber: string;
  subject: string;
  description: string;
  raisedBy: mongoose.Types.ObjectId;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWarehouseTask {
  _id?: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  taskType: "pick" | "pack" | "dispatch" | "cycle_count" | "transfer";
  assignedTo?: mongoose.Types.ObjectId;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  binIds: mongoose.Types.ObjectId[];
  shipmentIds: mongoose.Types.ObjectId[];
  completedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPincodeArea {
  _id?: mongoose.Types.ObjectId;
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
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "dispatcher", index: true },
  pincodeAreaId: { type: Schema.Types.ObjectId, ref: "PincodeArea", index: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", index: true },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  lat: { type: Number },
  lng: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BranchSchema = new Schema<IBranch>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  address: { type: String },
  pincodeAreaId: { type: Schema.Types.ObjectId, ref: "PincodeArea", required: true, index: true },
  phone: { type: String },
  email: { type: String },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  changeReason: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const VehicleSchema = new Schema<IVehicle>({
  registrationNumber: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },
  model: { type: String, required: true },
  capacity: { type: String },
  status: { type: String, default: "available" },
  driverId: { type: Schema.Types.ObjectId, ref: "User" },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", index: true },
  gpsDeviceId: { type: String },
  lastMaintenance: { type: Date },
  insuranceExpiry: { type: Date },
  lat: { type: Number },
  lng: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const WarehouseSchema = new Schema<IWarehouse>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  address: { type: String },
  pincodeAreaId: { type: Schema.Types.ObjectId, ref: "PincodeArea", index: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", index: true },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  phone: { type: String },
  email: { type: String },
  status: { type: String, default: "active" },
  capacity: { type: Number },
  lat: { type: Number },
  lng: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ShipmentSchema = new Schema<IShipment>({
  trackingNumber: { type: String, required: true, unique: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, default: "booked" },
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  driverId: { type: Schema.Types.ObjectId, ref: "User" },
  weight: { type: String },
  value: { type: String },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CompanyProfileSchema = new Schema<ICompanyProfile>({
  name: { type: String, required: true },
  legalName: { type: String, required: true },
  gstin: { type: String, required: true },
  pan: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  logo: { type: String },
  financialYearStart: { type: String, required: true },
  currency: { type: String, default: "INR" },
  timezone: { type: String, default: "Asia/Kolkata" },
  lat: { type: Number },
  lng: { type: Number },
  coverageRadius: { type: Number, default: 50 },
  serviceAreas: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RateCardSchema = new Schema<IRateCard>({
  name: { type: String, required: true },
  vehicleType: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  baseRatePerKm: { type: Number, required: true },
  fuelSurchargePercent: { type: Number, default: 0 },
  fragileHandlingCharge: { type: Number, default: 0 },
  temperatureControlCharge: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 5 },
  minWeight: { type: String, required: true },
  maxWeight: { type: String, required: true },
  effectiveFrom: { type: Date, default: Date.now },
  effectiveTo: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RateContractSchema = new Schema<IRateContract>({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  clientName: { type: String, required: true },
  contractNumber: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  creditLimit: { type: Number, required: true },
  paymentTerms: { type: String, required: true },
  specialRates: [{ route: String, ratePerKm: Number }],
  gstExempt: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "active", "expired", "terminated"], default: "draft" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TripManifestSchema = new Schema<ITripManifest>({
  manifestNumber: { type: String, required: true, unique: true },
  tripNumber: { type: String, required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
  driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date, required: true },
  actualStart: { type: Date },
  actualEnd: { type: Date },
  status: { type: String, enum: ["planned", "dispatched", "in_transit", "completed", "cancelled"], default: "planned" },
  shipmentIds: [{ type: Schema.Types.ObjectId, ref: "Shipment" }],
  totalWeight: { type: String },
  totalValue: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PODSchema = new Schema<IPOD>({
  shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment", required: true, unique: true },
  manifestId: { type: Schema.Types.ObjectId, ref: "TripManifest" },
  consigneeName: { type: String, required: true },
  consigneePhone: { type: String, required: true },
  deliveredAt: { type: Date, required: true },
  receivedBy: { type: String, required: true },
  signatureUrl: { type: String },
  photoUrl: { type: String },
  remarks: { type: String },
  damageReported: { type: Boolean, default: false },
  damageDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const IoTTelemetrySchema = new Schema<IIoTTelemetry>({
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
  driverId: { type: Schema.Types.ObjectId, ref: "User" },
  gpsDeviceId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speedKmph: { type: Number, required: true },
  engineRpm: { type: Number },
  fuelLevelPercent: { type: Number },
  temperatureCelsius: { type: Number },
  harshBraking: { type: Boolean, default: false },
  harshAcceleration: { type: Boolean, default: false },
  overSpeeding: { type: Boolean, default: false },
  location: { type: String },
  recordedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const FASTagTransactionSchema = new Schema<IFASTagTransaction>({
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
  tollPlaza: { type: String, required: true },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
  transactionType: { type: String, enum: ["debit", "credit", "auto_recharge"], default: "debit" },
  transactionDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const MaintenanceLogSchema = new Schema<IMaintenanceLog>({
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
  maintenanceType: { type: String, enum: ["service", "repair", "inspection", "tyre_change", "insurance", "fitness", "puc"], required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  vendorName: { type: String },
  invoiceNumber: { type: String },
  nextDueDate: { type: Date },
  odometerReading: { type: String },
  performedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const DriverComplianceSchema = new Schema<IDriverCompliance>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  licenseNumber: { type: String, required: true },
  licenseIssueDate: { type: Date, required: true },
  licenseExpiryDate: { type: Date, required: true },
  licenseClass: { type: String, required: true },
  policeVerificationStatus: { type: String, enum: ["pending", "verified", "expired"], default: "pending" },
  policeVerificationDate: { type: Date },
  medicalCheckupStatus: { type: String, enum: ["pending", "passed", "failed"], default: "pending" },
  medicalCheckupDate: { type: Date },
  aadharNumber: { type: String },
  emergencyContactName: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AttendanceSchema = new Schema<IAttendance>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  tripIds: [{ type: Schema.Types.ObjectId, ref: "TripManifest" }],
  status: { type: String, enum: ["present", "absent", "leave", "half_day"], default: "present" },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const PayrollSchema = new Schema<IPayroll>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  tripsCompleted: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  status: { type: String, enum: ["draft", "processed", "paid"], default: "draft" },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  shipmentIds: [{ type: Schema.Types.ObjectId, ref: "Shipment" }],
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  tdsAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["draft", "sent", "paid", "overdue", "cancelled"], default: "draft" },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TDSRecordSchema = new Schema<ITDSRecord>({
  invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  tdsRate: { type: Number, required: true },
  tdsAmount: { type: Number, required: true },
  section: { type: String, required: true },
  certificateNumber: { type: String },
  status: { type: String, enum: ["pending", "filed", "received"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const VendorPayoutSchema = new Schema<IVendorPayout>({
  vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  vendorName: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "approved", "paid", "overdue"], default: "pending" },
  paidAt: { type: Date },
  paymentMethod: { type: String },
  referenceNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  userName: { type: String },
  userRole: { type: String },
  action: { type: String, required: true },
  module: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId },
  entityType: { type: String },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const RolePermissionSchema = new Schema<IRolePermission>({
  role: { type: String, required: true, index: true },
  module: { type: String, required: true },
  permissions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const IntegrationConfigSchema = new Schema<IIntegrationConfig>({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  apiKey: { type: String },
  apiSecret: { type: String },
  endpoint: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastTestedAt: { type: Date },
  lastTestStatus: { type: String, enum: ["success", "failed"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ContactInquirySchema = new Schema<IContactInquiry>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["new", "in_progress", "resolved", "closed"], default: "new" },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NewsletterSubscriptionSchema = new Schema<INewsletterSubscription>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  company: { type: String },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
});

const ReportSchema = new Schema<IReport>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  query: { type: Schema.Types.Mixed },
  format: { type: String, enum: ["pdf", "excel", "csv"], default: "pdf" },
  isScheduled: { type: Boolean, default: false },
  scheduleCron: { type: String },
  lastGeneratedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BinLocationSchema = new Schema<IBinLocation>({
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
  zone: { type: String, required: true },
  rack: { type: String, required: true },
  shelf: { type: String, required: true },
  binCode: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  category: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const StockMovementSchema = new Schema<IStockMovement>({
  shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment" },
  binId: { type: Schema.Types.ObjectId, ref: "BinLocation", required: true },
  movementType: { type: String, enum: ["inbound", "outbound", "transfer", "adjustment"], required: true },
  quantity: { type: Number, required: true },
  referenceNumber: { type: String },
  performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const ClientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  company: { type: String, required: true },
  gstin: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  creditLimit: { type: Number, required: true, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive", "blocked"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String, required: true },
  source: { type: String, required: true },
  status: { type: String, enum: ["new", "contacted", "qualified", "proposal", "won", "lost"], default: "new" },
  expectedRevenue: { type: Number },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SupportTicketSchema = new Schema<ISupportTicket>({
  ticketNumber: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  resolution: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const WarehouseTaskSchema = new Schema<IWarehouseTask>({
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
  taskType: { type: String, enum: ["pick", "pack", "dispatch", "cycle_count", "transfer"], required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["pending", "in_progress", "completed", "cancelled"], default: "pending" },
  binIds: [{ type: Schema.Types.ObjectId, ref: "BinLocation" }],
  shipmentIds: [{ type: Schema.Types.ObjectId, ref: "Shipment" }],
  completedAt: { type: Date },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Branch: Model<IBranch> = mongoose.models.Branch || mongoose.model<IBranch>("Branch", BranchSchema);
export const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema);
export const Shipment: Model<IShipment> = mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", ShipmentSchema);
export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export const CompanyProfile: Model<ICompanyProfile> =
  mongoose.models.CompanyProfile || mongoose.model<ICompanyProfile>("CompanyProfile", CompanyProfileSchema);
export const RateCard: Model<IRateCard> = mongoose.models.RateCard || mongoose.model<IRateCard>("RateCard", RateCardSchema);
export const RateContract: Model<IRateContract> =
  mongoose.models.RateContract || mongoose.model<IRateContract>("RateContract", RateContractSchema);
export const TripManifest: Model<ITripManifest> =
  mongoose.models.TripManifest || mongoose.model<ITripManifest>("TripManifest", TripManifestSchema);
export const POD: Model<IPOD> = mongoose.models.POD || mongoose.model<IPOD>("POD", PODSchema);
export const IoTTelemetry: Model<IIoTTelemetry> =
  mongoose.models.IoTTelemetry || mongoose.model<IIoTTelemetry>("IoTTelemetry", IoTTelemetrySchema);
export const FASTagTransaction: Model<IFASTagTransaction> =
  mongoose.models.FASTagTransaction || mongoose.model<IFASTagTransaction>("FASTagTransaction", FASTagTransactionSchema);
export const MaintenanceLog: Model<IMaintenanceLog> =
  mongoose.models.MaintenanceLog || mongoose.model<IMaintenanceLog>("MaintenanceLog", MaintenanceLogSchema);
export const DriverCompliance: Model<IDriverCompliance> =
  mongoose.models.DriverCompliance || mongoose.model<IDriverCompliance>("DriverCompliance", DriverComplianceSchema);
export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
export const Payroll: Model<IPayroll> = mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", PayrollSchema);
export const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export const TDSRecord: Model<ITDSRecord> =
  mongoose.models.TDSRecord || mongoose.model<ITDSRecord>("TDSRecord", TDSRecordSchema);
export const VendorPayout: Model<IVendorPayout> =
  mongoose.models.VendorPayout || mongoose.model<IVendorPayout>("VendorPayout", VendorPayoutSchema);
export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export const RolePermission: Model<IRolePermission> =
  mongoose.models.RolePermission || mongoose.model<IRolePermission>("RolePermission", RolePermissionSchema);
export const IntegrationConfig: Model<IIntegrationConfig> =
  mongoose.models.IntegrationConfig || mongoose.model<IIntegrationConfig>("IntegrationConfig", IntegrationConfigSchema);
export const ContactInquiry: Model<IContactInquiry> =
  mongoose.models.ContactInquiry || mongoose.model<IContactInquiry>("ContactInquiry", ContactInquirySchema);
export const NewsletterSubscription: Model<INewsletterSubscription> =
  mongoose.models.NewsletterSubscription || mongoose.model<INewsletterSubscription>("NewsletterSubscription", NewsletterSubscriptionSchema);
export const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
export const BinLocation: Model<IBinLocation> =
  mongoose.models.BinLocation || mongoose.model<IBinLocation>("BinLocation", BinLocationSchema);
export const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement || mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
export const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
export const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
export const WarehouseTask: Model<IWarehouseTask> =
  mongoose.models.WarehouseTask || mongoose.model<IWarehouseTask>("WarehouseTask", WarehouseTaskSchema);
export const Warehouse: Model<IWarehouse> =
  mongoose.models.Warehouse || mongoose.model<IWarehouse>("Warehouse", WarehouseSchema);

const PincodeAreaSchema = new Schema<IPincodeArea>({
  name: { type: String, required: true },
  state: { type: String, required: true, index: true },
  city: { type: String, required: true, index: true },
  pincode: { type: String, required: true, unique: true, index: true },
  country: { type: String, default: "India" },
  branchName: { type: String },
  branchAddress: { type: String },
  branchCode: { type: String },
  branchState: { type: String },
  branchCity: { type: String },
  branchCountry: { type: String },
  branchRegion: { type: String },
  branchZone: { type: String },
  branchDivision: { type: String },
  branchDepartment: { type: String },
  branchSection: { type: String },
  branchUnit: { type: String },
  branchTeam: { type: String },
  branchGroup: { type: String },
  branchCategory: { type: String },
  branchType: { type: String },
  branchStatus: { type: String, enum: ["active", "inactive", "pending", "suspended"], default: "active" },
  lat: { type: Number },
  lng: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PincodeArea: Model<IPincodeArea> =
  mongoose.models.PincodeArea || mongoose.model<IPincodeArea>("PincodeArea", PincodeAreaSchema);

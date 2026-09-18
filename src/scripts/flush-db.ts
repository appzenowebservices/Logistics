import "dotenv/config";
import mongoose from "mongoose";

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
];

async function flush() {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const name of MODEL_NAMES) {
    try {
      const model = mongoose.models[name];
      if (model) {
        const result = await model.deleteMany({});
        console.log(`Dropped ${name}: ${result.deletedCount} documents`);
      }
    } catch (e) {
      console.error(`Failed to drop ${name}:`, e);
    }
  }
  console.log("Database flushed successfully.");
  await mongoose.disconnect();
}

flush().catch((e) => {
  console.error("Flush error:", e);
  process.exit(1);
});

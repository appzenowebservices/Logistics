import { NextRequest, NextResponse } from "next/server";

const rolePermissions: Record<string, string[]> = {
  super_admin: ["dashboard", "masters", "operations", "fleet", "drivers", "warehouse", "tracking", "geo", "finance", "crm", "reports", "notifications", "administration", "settings", "help"],
  admin: ["dashboard", "masters", "operations", "fleet", "drivers", "warehouse", "tracking", "geo", "finance", "crm", "reports", "notifications", "settings"],
  branch_manager: ["dashboard", "booking", "dispatch", "notifications"],
  driver: ["dashboard", "tracking", "notifications"],
  warehouse_manager: ["dashboard", "warehouse", "reports"],
  fleet_manager: ["dashboard", "fleet", "drivers", "tracking", "reports"],
  regional_manager: ["dashboard", "masters", "operations", "fleet", "drivers", "reports"],
};

const routeMenuMap: Record<string, string> = {
  "/dashboard": "dashboard",
  "/dashboard/masters": "masters",
  "/dashboard/masters/branch-managers": "masters",
  "/dashboard/masters/pincode-areas": "masters",
  "/dashboard/booking": "operations",
  "/dashboard/dispatch": "operations",
  "/dashboard/fleet": "fleet",
  "/dashboard/drivers": "drivers",
  "/dashboard/warehouse": "warehouse",
  "/dashboard/tracking": "tracking",
  "/dashboard/geo-intelligence": "geo",
  "/dashboard/finance": "finance",
  "/dashboard/crm": "crm",
  "/dashboard/reports": "reports",
  "/dashboard/notifications": "notifications",
  "/dashboard/administration": "administration",
  "/dashboard/settings": "settings",
  "/dashboard/help": "help",
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("alms_session")?.value;
  
  // Allow access to login page
  if (pathname === "/" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  
  // Check authentication
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  let user: { role?: string } | null = null;
  try {
    user = JSON.parse(sessionCookie);
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Find the menu key for this route
  const menuKey = routeMenuMap[pathname];
  if (menuKey && user?.role) {
    const allowedMenus = rolePermissions[user.role] || [];
    if (!allowedMenus.includes(menuKey)) {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
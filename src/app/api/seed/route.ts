import { NextResponse } from "next/server";
import { seedDatabase, DEMO_USERS } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await seedDatabase();
  return NextResponse.json({
    ...result,
    demoUsers: DEMO_USERS.map(u => ({ email: u.email, role: u.role, name: u.name, roleTitle: u.roleTitle }))
  });
}

export async function POST() {
  const result = await seedDatabase();
  return NextResponse.json(result);
}

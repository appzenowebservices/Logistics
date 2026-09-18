import { NextRequest, NextResponse } from "next/server";
import { DEMO_USERS } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("alms_session")?.value;
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie);
        return NextResponse.json({ authenticated: true, user: session });
      } catch {
        // ignore JSON parse error
      }
    }

    // Default unauthenticated fallback or return null
    return NextResponse.json({ authenticated: false, user: null });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: String(error) }, { status: 500 });
  }
}

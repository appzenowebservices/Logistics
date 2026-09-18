import { connectDB } from "@/db";
import { User } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    await User.countDocuments();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { User } from "@/db/schema";
import { seedDatabase, DEMO_USERS } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Never let seeding take down login (e.g. DB unreachable in prod).
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Login seed skipped:", error);
    }

    const body = await req.json();
    const { email, password, role } = body;

    const cookieOptions = {
      path: "/",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
    };

    if (role) {
      const demoTemplate = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
      let foundUser: any = null;
      try {
        foundUser = await User.findOne({ role: demoTemplate.role as any }).lean();
      } catch (error) {
        console.error("Login DB lookup skipped:", error);
      }

      const userToReturn = foundUser || {
        _id: new mongoose.Types.ObjectId(),
        name: demoTemplate.name,
        email: demoTemplate.email,
        role: demoTemplate.role,
        branchId: new mongoose.Types.ObjectId(),
      };

      const response = NextResponse.json({
        success: true,
        user: {
          id: userToReturn._id.toString(),
          name: userToReturn.name,
          email: userToReturn.email,
          role: userToReturn.role,
          roleTitle: demoTemplate.roleTitle,
          department: demoTemplate.department,
          branchId: userToReturn.branchId?.toString(),
        },
      });

      response.cookies.set("alms_session", JSON.stringify({
        id: userToReturn._id.toString(),
        name: userToReturn.name,
        email: userToReturn.email,
        role: userToReturn.role,
        roleTitle: demoTemplate.roleTitle,
        department: demoTemplate.department,
      }), cookieOptions);

      return response;
    }

    if (email) {
      let foundUsers: any = null;
      try {
        foundUsers = await User.findOne({ email }).lean();
      } catch (error) {
        console.error("Login DB lookup skipped:", error);
      }
      if (!foundUsers) {
        // Demo fallback so portal creds always work even if seed/DB failed.
        const demo = DEMO_USERS.find((u) => u.email === email);
        if (!demo) {
          return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
        }
        const demoId = new mongoose.Types.ObjectId().toString();
        const response = NextResponse.json({
          success: true,
          user: {
            id: demoId,
            name: demo.name,
            email: demo.email,
            role: demo.role,
            roleTitle: demo.roleTitle,
            department: demo.department,
          },
        });
        response.cookies.set("alms_session", JSON.stringify({
          id: demoId,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          roleTitle: demo.roleTitle,
          department: demo.department,
        }), cookieOptions);
        return response;
      }

      const user = foundUsers;
      const demoMeta = DEMO_USERS.find((u) => u.role === user.role) || DEMO_USERS[0];

      const response = NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          roleTitle: demoMeta?.roleTitle || user.role,
          department: demoMeta?.department || "Operations",
          branchId: user.branchId?.toString(),
        },
      });

      response.cookies.set("alms_session", JSON.stringify({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        roleTitle: demoMeta?.roleTitle || user.role,
        department: demoMeta?.department || "Operations",
      }), cookieOptions);

      return response;
    }

    return NextResponse.json({ success: false, error: "Missing login credentials" }, { status: 400 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Server error during login" }, { status: 500 });
  }
}

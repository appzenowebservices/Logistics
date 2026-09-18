import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";
import { cookies } from "next/headers";
import { db } from "@/server/db";

export async function createTRPCContext(opts?: FetchCreateContextFnOptions) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("alms_session")?.value;

  let user = null;
  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie);
    } catch {
      // invalid JSON
    }
  }

  return {
    db,
    user,
    req: opts?.req,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const router = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  if (process.env.NODE_ENV === "development") {
    console.log(`[TRPC] ${path} took ${end - start}ms`);
  }
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const rolePermissions: Record<string, string[]> = {
  super_admin: ["dashboard", "masters", "operations", "fleet", "drivers", "warehouse", "tracking", "finance", "crm", "reports", "notifications", "administration", "settings", "help"],
  admin: ["dashboard", "masters", "operations", "fleet", "drivers", "warehouse", "tracking", "finance", "crm", "reports", "notifications", "settings"],
  branch_manager: ["dashboard", "booking", "dispatch", "notifications"],
  driver: ["dashboard", "tracking", "notifications"],
  warehouse_manager: ["dashboard", "warehouse", "reports"],
  fleet_manager: ["dashboard", "fleet", "drivers", "tracking", "reports"],
  regional_manager: ["dashboard", "masters", "operations", "fleet", "drivers", "reports"],
};

export const roleProtectedProcedure = (allowedRoles: string[]) => {
  return t.procedure.use(timingMiddleware).use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }

    const userRole = ctx.user.role;
    const userPermissions = rolePermissions[userRole] || [];
    const hasAccess = allowedRoles.some(role => userPermissions.includes(role));
    
    if (!hasAccess) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "You are not authorized to access this menu" 
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });
};

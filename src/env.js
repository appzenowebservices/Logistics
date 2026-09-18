import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

export const env = createEnv({
  server: {
    AUTH_SECRET: isProd ? z.string().min(1) : z.string().optional(),
    // Primary DB url (Prisma + Mongoose + compose). MONGODB_URI is a
    // backwards-compat alias — set either one, DATABASE_URL wins.
    DATABASE_URL: isProd ? z.string().min(1) : z.string().optional(),
    MONGODB_URI: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {},
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

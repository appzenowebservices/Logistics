import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import SuperJSON from "superjson";

import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";
import { createQueryClient } from "./query-client";

/**
 * Server-side tRPC caller for React Server Components.
 * Use in async Server Components:
 *   const trpc = await api();
 *   const bookings = await trpc.bookings.list();
 */
export const api = cache(async () => {
  const queryClient = createQueryClient();
  const ctx = await createTRPCContext();
  const caller = appRouter.createCaller(ctx);
  const helpers = createHydrationHelpers<typeof appRouter>(
    caller,
    () => queryClient,
  );
  return { ...helpers, caller, queryClient };
});

export { SuperJSON };

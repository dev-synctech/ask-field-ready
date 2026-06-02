import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Legacy return URL — redirect to the canonical /payment-success activation screen.
export const Route = createFileRoute("/checkout/return")({
  validateSearch: z.object({ session_id: z.string().optional() }).parse,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/payment-success", search });
  },
  component: () => null,
});

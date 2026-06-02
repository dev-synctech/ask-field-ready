import { createFileRoute, redirect } from "@tanstack/react-router";

// TODO: REMOVE BEFORE PRODUCTION LAUNCH — checkout is disabled in the demo build.
export const Route = createFileRoute("/checkout")({
  beforeLoad: () => { throw redirect({ to: "/ask" }); },
  component: () => null,
});

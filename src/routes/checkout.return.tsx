import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  beforeLoad: () => { throw redirect({ to: "/ask" }); },
  component: () => null,
});

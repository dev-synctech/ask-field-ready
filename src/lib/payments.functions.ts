import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type Result = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`, limit: 1,
  });
  if (found.data.length) return found.data[0].id;
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      returnUrl: z.string().url(),
      environment: z.enum(['sandbox', 'live']),
    }).parse
  )
  .handler(async ({ data, context }): Promise<Result> => {
    try {
      const { userId, supabase } = context;
      const env: StripeEnv = data.environment;
      const stripe = createStripeClient(env);

      const { data: userResult } = await supabase.auth.getUser();
      const email = userResult.user?.email;

      const prices = await stripe.prices.list({ lookup_keys: ['academy_access_onetime'] });
      if (!prices.data.length) return { error: 'Price not found. Re-run product setup.' };
      const price = prices.data[0];

      const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

      const productId = typeof price.product === 'string' ? price.product : price.product.id;
      const product = await stripe.products.retrieve(productId);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: 'payment',
        ui_mode: 'embedded_page',
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: product.name },
        managed_payments: { enabled: true },
        metadata: { userId, managed_payments: 'true' },
      });

      return { clientSecret: session.client_secret ?? '' };
    } catch (error) {
      console.error('createCheckoutSession error:', error);
      return { error: getStripeErrorMessage(error) };
    }
  });

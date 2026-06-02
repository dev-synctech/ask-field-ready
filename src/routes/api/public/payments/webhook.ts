import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata', session.id);
    return;
  }
  if (session.payment_status !== 'paid') return;

  await getSupabase().from('entitlements').upsert(
    {
      user_id: userId,
      status: 'active',
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
      amount_cents: session.amount_total ?? null,
      granted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

async function handleRefund(paymentIntentId: string) {
  await getSupabase()
    .from('entitlements')
    .update({ status: 'refunded', updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent', paymentIntentId);
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get('env');
        if (rawEnv !== 'sandbox' && rawEnv !== 'live') {
          return Response.json({ received: true, ignored: 'invalid env' });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case 'checkout.session.completed':
            case 'transaction.completed':
              await handleCheckoutCompleted(event.data.object);
              break;
            case 'charge.refunded':
            case 'transaction.payment_failed': {
              const obj = event.data.object;
              const pi = typeof obj.payment_intent === 'string' ? obj.payment_intent : obj.payment_intent?.id;
              if (pi) await handleRefund(pi);
              break;
            }
            default:
              console.log('Unhandled event:', event.type);
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error('Webhook error:', e);
          return new Response('Webhook error', { status: 400 });
        }
      },
    },
  },
});

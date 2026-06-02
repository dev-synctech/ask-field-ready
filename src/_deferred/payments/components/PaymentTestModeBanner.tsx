const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-destructive/10 border-b border-destructive/30 px-4 py-2 text-center text-xs text-destructive">
        Live checkout is not configured yet. Complete payment go-live to accept real payments.
      </div>
    );
  }
  if (clientToken.startsWith('pk_test_')) {
    return (
      <div className="w-full bg-warning/15 border-b border-warning/30 px-4 py-2 text-center text-xs text-foreground/80">
        Preview mode — payments are in test mode. Use card <span className="font-mono">4242 4242 4242 4242</span>.
      </div>
    );
  }
  return null;
}

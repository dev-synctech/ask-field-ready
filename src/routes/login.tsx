import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { MailCheck } from "lucide-react";
import { DemoModeButton } from "@/components/DemoModeButton";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    mode: z.enum(['signin', 'signup']).optional(),
    redirect: z.string().optional(),
  }).parse,
  beforeLoad: async ({ search }) => {
    // Use getUser() — re-validates the JWT; getSession() can return stale cached tokens.
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      // Already signed in → route by entitlement (paid → /ask, otherwise → /checkout).
      const { data: ent } = await supabase
        .from('entitlements').select('status').maybeSingle();
      const target = search.redirect || (ent?.status === 'active' ? '/ask' : '/checkout');
      throw redirect({ to: target as any });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>(search.mode ?? 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function routeAfterAuth() {
    const { data: userData } = await supabase.auth.getUser();
    if (import.meta.env.DEV) console.debug('[auth] post-auth current user:', userData.user?.id ?? null);
    const { data: ent } = await supabase
      .from('entitlements').select('status').maybeSingle();
    if (import.meta.env.DEV) console.debug('[auth] post-auth entitlement:', ent);
    const target = search.redirect || (ent?.status === 'active' ? '/ask' : '/checkout');
    if (import.meta.env.DEV) console.debug('[auth] routing to:', target);
    navigate({ to: target as any, replace: true });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { display_name: displayName || email.split('@')[0] },
          },
        });
        if (import.meta.env.DEV) {
          console.debug('[auth] signup response:', {
            userExists: !!data?.user,
            sessionExists: !!data?.session,
            errorCode: (error as any)?.code,
            errorMsg: error?.message,
          });
        }
        if (error) {
          // Supabase returns "User already registered" → guide them to sign-in.
          if ((error as any).code === 'user_already_exists' || /already registered/i.test(error.message)) {
            setMode('signin');
            setError('An account with this email already exists. Please sign in instead.');
            return;
          }
          throw error;
        }
        // No session means email confirmation is required.
        if (!data.session) {
          if (import.meta.env.DEV) console.debug('[auth] signup requires email confirmation');
          setCheckEmail(true);
          return;
        }
        await routeAfterAuth();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (import.meta.env.DEV) {
          console.debug('[auth] login response:', {
            sessionExists: !!data?.session,
            errorCode: (error as any)?.code,
            errorMsg: error?.message,
          });
        }
        if (error) throw error;
        await routeAfterAuth();
      }
    } catch (err: any) {
      if (import.meta.env.DEV) console.debug('[auth] error surfaced:', err);
      setError(err?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }


  async function resend() {
    setResendState('sending');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResendState(error ? 'error' : 'sent');
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-5 h-16 flex items-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-5 pb-12">
          <div className="w-full max-w-sm text-center">
            <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <MailCheck className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Click it to finish setting up your account.
            </p>
            <button
              onClick={resend}
              disabled={resendState === 'sending' || resendState === 'sent'}
              className="mt-6 inline-flex h-11 px-5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent disabled:opacity-60"
            >
              {resendState === 'sending' ? 'Sending…'
                : resendState === 'sent' ? 'Email sent ✓'
                : resendState === 'error' ? 'Try again'
                : 'Resend confirmation email'}
            </button>
            <div className="mt-6 text-xs text-muted-foreground">
              Wrong address?{' '}
              <button onClick={() => { setCheckEmail(false); setResendState('idle'); }} className="text-primary font-medium">
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 h-16 flex items-center">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-5 pb-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-semibold">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'signup' ? 'Start with the academy in 30 seconds.' : 'Sign in to continue.'}
            </p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <Input label="Name" value={displayName} onChange={setName} placeholder="Alex" />
            )}
            <Input type="email" label="Email" value={email} onChange={setEmail} placeholder="you@hospital-system.com" required />
            <Input type="password" label="Password" value={password} onChange={setPassword} placeholder="••••••••" required minLength={8} />
            {error && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</div>}
            <button disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-60">
              {loading ? 'Working…' : (mode === 'signup' ? 'Create account' : 'Sign in')}
            </button>
            {mode === 'signin' && (
              <div className="text-right">
                <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link>
              </div>
            )}
          </form>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <>Already have an account? <button onClick={() => { setMode('signin'); setError(''); }} className="text-primary font-medium">Sign in</button></>
            ) : (
              <>New here? <button onClick={() => { setMode('signup'); setError(''); }} className="text-primary font-medium">Create account</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', ...rest }: any) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full h-11 rounded-xl border border-input bg-surface-elevated px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        {...rest}
      />
    </label>
  );
}

import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    mode: z.enum(['signin', 'signup']).optional(),
    redirect: z.string().optional(),
  }).parse,
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: (search.redirect as any) || '/ask' });
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/ask`,
            data: { display_name: displayName || email.split('@')[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: (search.redirect as any) || '/ask' });
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
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
          </form>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <>Already have an account? <button onClick={() => setMode('signin')} className="text-primary font-medium">Sign in</button></>
            ) : (
              <>New here? <button onClick={() => setMode('signup')} className="text-primary font-medium">Create account</button></>
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

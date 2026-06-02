import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const askKnowledgeBase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ q: z.string().min(2).max(500) }).parse)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const q = data.q.trim();
    const tokens = q.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Search content_items by title/summary/tags. RLS limits results to
    // published+sanitized AND paid users (or admin).
    const { data: items, error } = await supabase
      .from('content_items')
      .select('id,title,summary,content_type,tags,estimated_minutes,difficulty,module_id')
      .limit(40);

    if (error) {
      return { error: error.message, shortAnswer: '', steps: [], related: { playbooks: [], videos: [], checklists: [], scenarios: [] }, sources: [] };
    }

    const score = (it: any) => {
      const hay = `${it.title} ${it.summary ?? ''} ${(it.tags ?? []).join(' ')}`.toLowerCase();
      return tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
    };
    const ranked = (items ?? [])
      .map(it => ({ it, s: score(it) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);

    const top = ranked.slice(0, 8).map(x => x.it);
    const pick = (type: string) => top.filter(t => t.content_type === type).slice(0, 4);

    // Short answer is template-built from top match summary. Designed to
    // be swapped for an LLM call against the same retrieved set later.
    const best = top[0];
    const shortAnswer = best
      ? `Based on your library: ${best.summary ?? best.title}.`
      : `No matching content yet. Try broader terms (e.g. "downtime", "registration", "escalation") or ask an admin to publish more material.`;

    const steps = best
      ? [
          `Open the related playbook for "${best.title}" and skim the overview.`,
          `Confirm the workflow with your floor lead or command center contact.`,
          `Use the checklist before you escalate.`,
          `If unresolved, escalate per the command center matrix.`,
        ]
      : [];

    return {
      shortAnswer,
      steps,
      related: {
        playbooks: pick('playbook'),
        videos: pick('video'),
        checklists: pick('checklist'),
        scenarios: pick('scenario'),
      },
      sources: top.slice(0, 5).map(t => ({ id: t.id, title: t.title, type: t.content_type })),
      lessonId: top.find(t => t.content_type === 'lesson')?.id ?? best?.id ?? null,
    };
  });

export const getSignedFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    bucket: z.enum(['videos', 'documents']),
    path: z.string().min(1),
  }).parse)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: signed, error } = await supabase.storage
      .from(data.bucket)
      .createSignedUrl(data.path, 60 * 30); // 30 min
    if (error) return { error: error.message, url: null };
    return { url: signed.signedUrl, error: null };
  });

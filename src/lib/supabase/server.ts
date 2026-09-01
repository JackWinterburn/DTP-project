import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase clients.
 *
 * Ada Course Finder has no user accounts (anonymous-by-default per the
 * Architecture doc / NFR on data minimisation), so there is no session or
 * auth-cookie handling here -- every request from the quiz UI goes through
 * our own Next.js API routes (see src/app/api/*), which call Supabase
 * server-side using one of the two clients below. Nothing in this file is
 * imported by client components.
 *
 * - getSupabaseClient(): the anonymous ("publishable") key. Respects Row
 *   Level Security -- this is what every API route should use by default
 *   (insert a session/result, select a result only by its share_token,
 *   insert an email opt-in). See Architecture doc Section 4 for the RLS
 *   policies this key is scoped by.
 * - getSupabaseAdminClient(): the service-role key. Bypasses RLS. Reserved
 *   for privileged, server-only aggregate reads -- e.g. the staff dashboard
 *   (Phase 7, tickets #26-28). Not wired up yet: SUPABASE_SERVICE_ROLE_KEY
 *   is left blank until that phase, and this throws a clear error if called
 *   before it's set, rather than silently falling back to the public key.
 */

let publicClient: SupabaseClient | undefined;
let adminClient: SupabaseClient | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseClient(): SupabaseClient {
  if (!publicClient) {
    publicClient = createSupabaseClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
      { auth: { persistSession: false } },
    );
  }
  return publicClient;
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createSupabaseClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } },
    );
  }
  return adminClient;
}

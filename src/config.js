// Paste your Supabase project details here (Supabase dashboard -> Project Settings -> API).
// The "anon" / "publishable" key is made to be public, so it is safe to commit to GitHub.
export const SUPABASE_URL = 'https://plnbwsvxexztzdlffiou.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_b5nVQiwKIn2z9e1xOTAjFA_nVigVRaA';

export const isConfigured =
  !SUPABASE_URL.startsWith('YOUR_') && !SUPABASE_ANON_KEY.startsWith('YOUR_');

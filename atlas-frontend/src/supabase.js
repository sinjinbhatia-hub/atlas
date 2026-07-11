import { createClient } from '@supabase/supabase-js'

// Publishable key — safe to expose in client code. Override via Vite env vars per environment.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://fqqczbnmjcmgnbhllgmi.supabase.co"
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_0WdNAq0DUblLHDu-dUev2A_YfzggNoE"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

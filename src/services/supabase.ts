import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://moppuikcjqbqkppanvfj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NnfuP7DINeyEUOL7UYdzDg_jfHG7T5a';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

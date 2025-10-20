import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_S_KEY;

const supabase_v2 = createClient(supabaseUrl, supabaseAnonKey);

export { supabase_v2 };

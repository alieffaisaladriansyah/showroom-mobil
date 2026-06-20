import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createBrowserClient otomatis menangani cookie,
// sehingga sesi kamu akan konsisten di browser & middleware.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

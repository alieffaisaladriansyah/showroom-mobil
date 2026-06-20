import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from("mobil")
      .select("id, nama, merek, harga, diskon, gambar_urls")
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ data, error: error?.message ?? null });
  } catch (err) {
    return NextResponse.json({ data: null, error: String(err) });
  }
}

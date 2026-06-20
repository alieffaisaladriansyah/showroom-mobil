import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import HalamanDetailMobilClient from "@/komponen/Beranda/HalamanDetailMobilClient";

export const revalidate = 60;

async function ambilDetailMobil(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  );

  // Coba cari berdasar id string, lalu fallback numeric bila perlu
  const initial = await supabase
    .from("mobil")
    .select("*")
    .eq("id", id)
    .single();

  if (initial.data) return initial.data;

  const maybeNumber = Number(id);
  if (Number.isFinite(maybeNumber)) {
    const res = await supabase
      .from("mobil")
      .select("*")
      .eq("id", maybeNumber)
      .single();
    return res.data ?? null;
  }

  return null;
}

export default async function HalamanDetailMobil({
  params,
}: Readonly<{ params: { id: string } }>) {
  if (!params?.id) notFound();

  const mobil = await ambilDetailMobil(params.id);

  // Render client component: server may not see data due to RLS/env; client will retry
  return <HalamanDetailMobilClient initialMobil={mobil} id={params.id} />;
}

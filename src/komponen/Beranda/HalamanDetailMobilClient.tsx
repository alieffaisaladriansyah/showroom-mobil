"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GaleriMobil from "./GaleriMobil";
import DetailMobil from "./DetailMobil";

interface Mobil {
  id: string | number;
  nama: string;
  merek: string;
  harga: number;
  diskon: number;
  deskripsi?: string | null;
  fitur?: string[];
  gambar_urls?: string[];
}

export default function HalamanDetailMobilClient({
  initialMobil,
  id,
}: {
  initialMobil: Mobil | null;
  id: string;
}) {
  const [mobil, setMobil] = useState<Mobil | null>(
    initialMobil as unknown as Mobil | null,
  );
  const [loading, setLoading] = useState(!initialMobil);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchMobil() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("mobil")
          .select("*")
          .eq("id", id)
          .single();
        if (error || !data) {
          // try numeric fallback
          const maybeNumber = Number(id);
          if (Number.isFinite(maybeNumber)) {
            const r = await supabase
              .from("mobil")
              .select("*")
              .eq("id", maybeNumber)
              .single();
            if (r.data) {
              if (mounted) setMobil(r.data as Mobil);
              setError(null);
              return;
            }
          }
          if (mounted) setError(error?.message ?? "Data tidak ditemukan");
        } else {
          if (mounted) setMobil(data as Mobil);
        }
      } catch (err) {
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!initialMobil) fetchMobil();
    return () => {
      mounted = false;
    };
  }, [id, initialMobil]);

  if (loading) return <div className="p-8">Memuat detail unit...</div>;
  if (error)
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h3 className="text-lg font-bold">Gagal memuat data</h3>
        <p className="text-sm text-slate-600 mt-2">{error}</p>
        <p className="text-sm text-slate-400 mt-2">
          Coba refresh atau periksa panel admin.
        </p>
      </div>
    );

  if (!mobil)
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h3 className="text-lg font-bold">Unit tidak ditemukan</h3>
        <p className="text-sm text-slate-600 mt-2">
          Pastikan unit sudah diinput di panel admin.
        </p>
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <GaleriMobil
            gambar_urls={mobil.gambar_urls ?? []}
            nama={mobil.nama}
          />
          <DetailMobil mobil={mobil as any} />
        </div>
      </div>
    </main>
  );
}

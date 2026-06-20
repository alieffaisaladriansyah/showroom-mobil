"use client";

import React, { useEffect, useState } from "react";
import KartuMobil from "@/komponen/Beranda/KartuMobil";
import KartuMobilBesar from "@/komponen/Beranda/KartuMobilBesar";
import { supabase } from "@/lib/supabase";

export default function DaftarMobilClient() {
  interface Mobil {
    id: string | number;
    nama: string;
    merek: string;
    harga: number;
    diskon: number;
    deskripsi?: string | null;
    fitur?: string[];
    gambar_urls?: string[];
    banner_url?: string | null;
    created_at?: string;
  }

  const [listMobil, setListMobil] = useState<Mobil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchMobil() {
      try {
        const { data } = await supabase
          .from("mobil")
          .select("*")
          .order("created_at", { ascending: false });
        if (mounted && data) {
          const raw = data as unknown as Array<Record<string, unknown>>;
          const getString = (v: unknown) => {
            if (v == null) return "";
            if (typeof v === "string") return v;
            if (typeof v === "number" || typeof v === "boolean")
              return String(v);
            return ""; // avoid stringifying objects
          };
          const getNumber = (v: unknown) => {
            if (typeof v === "number") return v;
            if (typeof v === "string") {
              const n = Number(v);
              return Number.isFinite(n) ? n : 0;
            }
            return 0;
          };
          const getStringArray = (v: unknown) => {
            if (!Array.isArray(v)) return [];
            const out: string[] = [];
            for (const x of v) if (typeof x === "string") out.push(x);
            return out;
          };

          const normalized: Mobil[] = raw.map((d) => {
            let createdAt: string | undefined;
            if (typeof d.created_at === "string") createdAt = d.created_at;
            else if (typeof d.created_at === "number")
              createdAt = String(d.created_at);
            else createdAt = undefined;

            return {
              id: getString(d.id),
              nama: getString(d.nama),
              merek: getString(d.merek),
              harga: getNumber(d.harga),
              diskon: getNumber(d.diskon),
              deskripsi: d.deskripsi == null ? null : getString(d.deskripsi),
              fitur: getStringArray(d.fitur),
              gambar_urls: getStringArray(d.gambar_urls),
              banner_url: d.banner_url == null ? null : getString(d.banner_url),
              created_at: createdAt,
            };
          });
          setListMobil(normalized);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchMobil();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;

  const barisPertama = listMobil.slice(0, 4);
  const barisKeduaBesar = listMobil.slice(4, 6);
  const barisKetiga = listMobil.slice(6, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
      {barisPertama.length > 0 && (
        <section aria-label="Koleksi Unggulan Pertama">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {barisPertama.map((item) => (
              <KartuMobil
                key={item.id}
                id={String(item.id)}
                nama={item.nama}
                merek={item.merek}
                harga={item.harga}
                diskon={item.diskon}
                gambar={item.gambar_urls?.[0] || ""}
              />
            ))}
          </div>
        </section>
      )}

      {barisKeduaBesar.length > 0 && (
        <section aria-label="Sorotan Khusus Unit Premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {barisKeduaBesar.map((item) => (
              <KartuMobilBesar
                key={item.id}
                id={String(item.id)}
                nama={item.nama}
                merek={item.merek}
                harga={item.harga}
                diskon={item.diskon}
                gambar_urls={item.gambar_urls ?? []}
              />
            ))}
          </div>
        </section>
      )}

      {barisKetiga.length > 0 && (
        <section aria-label="Koleksi Pilihan Tambahan">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {barisKetiga.map((item) => (
              <KartuMobil
                key={item.id}
                id={String(item.id)}
                nama={item.nama}
                merek={item.merek}
                harga={item.harga}
                diskon={item.diskon}
                gambar={item.gambar_urls?.[0] || ""}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import React from "react";
import BannerIklan from "@/komponen/Beranda/BannerIklan";
import MenuCepat from "@/komponen/Beranda/MenuCepat";
import KartuMobil from "@/komponen/Beranda/KartuMobil";
import KartuMobilBesar from "@/komponen/Beranda/KartuMobilBesar";
import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Mengoptimalkan cache server-side, di-refresh setiap 60 detik

async function ambilSemuaMobil() {
  const { data } = await supabase
    .from("mobil")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function HalamanBeranda() {
  const listMobil = await ambilSemuaMobil();

  // Membagi urutan tampilan sesuai struktur request khusus kamu
  const barisPertama = listMobil.slice(0, 4);
  const barisKeduaBesar = listMobil.slice(4, 6);
  const barisKetiga = listMobil.slice(6, 10);

  return (
    <main className="min-h-screen pb-20 bg-slate-50">
      <header aria-label="Area Banner Iklan">
        <BannerIklan />
      </header>
      <MenuCepat />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* BARIS 1: 4 Card Kecil */}
        {barisPertama.length > 0 && (
          <section aria-label="Koleksi Unggulan Pertama">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {barisPertama.map((item) => (
                <KartuMobil
                  key={item.id}
                  id={item.id}
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

        {/* BARIS 2: 2 Card Besar */}
        {barisKeduaBesar.length > 0 && (
          <section aria-label="Sorotan Khusus Unit Premium">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {barisKeduaBesar.map((item) => (
                <KartuMobilBesar
                  key={item.id}
                  id={item.id}
                  nama={item.nama}
                  merek={item.merek}
                  harga={item.harga}
                  diskon={item.diskon}
                  gambar_urls={item.gambar_urls}
                />
              ))}
            </div>
          </section>
        )}

        {/* BARIS 3: 4 Card Kecil Lanjutan */}
        {barisKetiga.length > 0 && (
          <section aria-label="Koleksi Pilihan Tambahan">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {barisKetiga.map((item) => (
                <KartuMobil
                  key={item.id}
                  id={item.id}
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
    </main>
  );
}

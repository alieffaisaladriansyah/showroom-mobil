"use client";

import React, { useState } from "react";

interface Props {
  gambar_urls?: string[];
  nama?: string;
}

export default function GaleriMobil({
  gambar_urls = [],
  nama = "Gambar",
}: Props) {
  const [aktif, setAktif] = useState(0);

  const utama =
    gambar_urls.length > 0 ? gambar_urls[aktif] : "/gambar/logo.png";

  return (
    <section
      className="lg:col-span-7 space-y-4"
      aria-label="Galeri Gambar Mobil"
    >
      <div className="aspect-16/10 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <img src={utama} alt={nama} className="w-full h-full object-cover" />
      </div>

      {gambar_urls.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {gambar_urls.slice(0, 8).map((url, i) => (
            <button
              key={url || String(i)}
              type="button"
              onClick={() => setAktif(i)}
              className={`aspect-16/10 rounded-xl overflow-hidden bg-white border transition-all ${
                i === aktif ? "border-blue-600" : "border-slate-200"
              }`}
              aria-label={`Pilih gambar ${i + 1}`}
            >
              <img
                src={url}
                alt={`Koleksi ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

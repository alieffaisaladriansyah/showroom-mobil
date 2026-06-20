"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Banner {
  id: number;
  gambar_url: string;
  judul: string;
  aktif: boolean;
}

export default function BannerIklan() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Ambil data banner dari Supabase
  useEffect(() => {
    async function ambilBanner() {
      try {
        const { data, error } = await supabase
          .from("banners")
          .select("id, gambar_url, judul, aktif")
          .eq("aktif", true)
          .order("urutan", { ascending: true });

        if (error) throw new Error(error.message);
        if (data) setBanners(data as Banner[]);
      } catch (err) {
        console.error("BannerIklan Error:", err);
      } finally {
        setLoading(false);
      }
    }
    ambilBanner();
  }, []);

  if (loading) return null;
  if (banners.length === 0) return null;

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      aria-label="Banner Promosi"
    >
      {/* Grid Layout untuk menggantikan Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((item) => (
          <article
            key={item.id}
            className="relative h-[140px] sm:h-[200px] group cursor-pointer bg-slate-100 rounded-xl overflow-hidden"
          >
            <img
              src={item.gambar_url}
              alt={item.judul || "Promosi Showroom"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {item.judul && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <header>
                  <h3 className="text-white font-medium text-xs sm:text-sm tracking-wide">
                    {item.judul}
                  </h3>
                </header>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

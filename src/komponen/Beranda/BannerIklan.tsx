"use client";

import React, { useState, useEffect } from "react";
import { useKeenSlider, KeenSliderInstance } from "keen-slider/react";
import { supabase } from "@/lib/supabase";
import "keen-slider/keen-slider.min.css";

interface Banner {
  id: number;
  gambar_url: string;
  judul: string;
  aktif: boolean;
}

export default function BannerIklan() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [slideAktif, setSlideAktif] = useState<number>(0);

  // SOLUSI UTAMA: Simpan total halaman slider dan instans ke dalam state biasa, BUKAN dibaca dari Ref saat render
  const [totalSlide, setTotalSlide] = useState<number>(0);
  const [sliderInstance, setSliderInstance] =
    useState<KeenSliderInstance | null>(null);

  // 1. Ambil data banner dari database Supabase
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
        const pesan =
          err instanceof Error ? err.message : "Gagal memuat banner.";
        console.error("BannerIklan Error:", pesan);
      }
    }
    ambilBanner();
  }, []);

  // 2. Inisialisasi KeenSlider (Manipulasi state hanya dilakukan di dalam Event Hook)
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setSlideAktif(slider.track.details.rel);
    },
    created(slider) {
      setTotalSlide(slider.track.details.slides.length);
      setSliderInstance(slider); // Simpan instans objek ke state agar aman diakses di onClick
    },
    loop: banners.length > 3,
    slides: { perView: 2, spacing: 12 },
    breakpoints: {
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 16 },
      },
    },
  });

  // 3. Sinkronisasi ulang track internal saat state data database 'banners' berubah
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.update();
      // Update juga jumlah dots-nya jika jumlah banner berubah secara dinamis
      if (instanceRef.current.track?.details?.slides) {
        setTotalSlide(instanceRef.current.track.details.slides.length);
      }
    }
  }, [banners, instanceRef]);

  // Jika data belum ditarik atau kosong, jangan render komponen apa pun
  if (banners.length === 0) return null;

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      aria-label="Banner Promosi"
    >
      {/* Container Slider */}
      <div
        ref={sliderRef}
        className="keen-slider rounded-xl overflow-hidden"
        role="region"
        aria-live="polite"
      >
        {banners.map((item) => (
          <article
            key={item.id}
            className="keen-slider__slide relative h-[140px] sm:h-[200px] group cursor-pointer bg-slate-100"
          >
            <img
              src={item.gambar_url}
              alt={item.judul || "Promosi Showroom"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
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

      {/* Navigasi Titik Indikator (Dots) - SEKARANG 100% AMAN DAN HALAL MENURUT ATURAN REACT */}
      {totalSlide > 0 && sliderInstance && (
        <nav
          className="flex justify-center gap-1.5 mt-4"
          aria-label="Navigasi slide"
        >
          {Array.from(Array(totalSlide).keys()).map((idx) => (
            <button
              key={idx}
              type="button"
              // Fungsi dipanggil di dalam event handler (bukan saat render), jadi ini valid
              onClick={() => sliderInstance.moveToIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                slideAktif === idx ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300"
              }`}
              aria-current={slideAktif === idx ? "true" : "false"}
              aria-label={`Buka slide ke ${idx + 1}`}
            />
          ))}
        </nav>
      )}
    </section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
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
  const [siap, setSiap] = useState<boolean>(false);

  useEffect(() => {
    async function ambilBanner() {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("aktif", true)
        .order("urutan", { ascending: true });
      if (data) setBanners(data);
    }
    ambilBanner();
  }, []);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      initial: 0,
      slideChanged(slider) {
        setSlideAktif(slider.track.details.rel);
      },
      created() {
        setSiap(true);
      },
      loop: banners.length > 3,
      slides: { perView: 2, spacing: 12 }, // Mobile aktif 2 banner
      breakpoints: {
        "(min-width: 1024px)": {
          slides: { perView: 3, spacing: 16 }, // Desktop aktif 3 banner
        },
      },
    },
    [banners],
  );

  if (banners.length === 0) return null;

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      aria-label="Banner Promosi"
    >
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
              alt={item.judul || "Promosi"}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
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

      {siap && instanceRef.current && (
        <nav
          className="flex justify-center gap-1.5 mt-4"
          aria-label="Navigasi slide"
        >
          {Array.from(Array(banners.length).keys()).map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${slideAktif === idx ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300"}`}
              aria-current={slideAktif === idx ? "true" : "false"}
            />
          ))}
        </nav>
      )}
    </section>
  );
}

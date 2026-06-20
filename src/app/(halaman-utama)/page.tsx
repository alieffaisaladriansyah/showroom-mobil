import React from "react";
import BannerIklan from "@/komponen/Beranda/BannerIklan";
import MenuCepat from "@/komponen/Beranda/MenuCepat";
import DaftarMobilClient from "@/komponen/Beranda/DaftarMobilClient";

export default function HalamanBeranda() {
  return (
    <main className="min-h-screen pb-20 bg-slate-50">
      <header aria-label="Area Banner Iklan">
        <BannerIklan />
      </header>
      <MenuCepat />

      <DaftarMobilClient />
    </main>
  );
}

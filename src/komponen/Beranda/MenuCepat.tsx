import React from "react";
import { ShieldCheck, Sparkles, Sliders, BadgePercent } from "lucide-react";

export default function MenuCepat() {
  const daftarMenu = [
    { ikon: <Sparkles className="h-5 w-5" />, label: "Koleksi Terbaru" },
    { ikon: <BadgePercent className="h-5 w-5" />, label: "Promo Diskon" },
    { ikon: <ShieldCheck className="h-5 w-5" />, label: "Garansi Resmi" },
    { ikon: <Sliders className="h-5 w-5" />, label: "Bandingkan Unit" },
  ];

  return (
    <nav
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      aria-label="Menu navigasi cepat"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {daftarMenu.map((menu, indeks) => (
          <button
            key={indeks}
            className="flex items-center justify-center gap-3 bg-white hover:bg-slate-100 border border-slate-200 p-4 rounded-xl shadow-sm transition-all text-sm font-semibold text-slate-700"
          >
            <span className="text-blue-600">{menu.ikon}</span>
            <span>{menu.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

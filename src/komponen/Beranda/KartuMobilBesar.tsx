import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PropertiMobil {
  id: string;
  nama: string;
  merek: string;
  harga: number;
  diskon: number;
  gambar_urls: string[];
}

export default function KartuMobilBesar({
  id,
  nama,
  merek,
  harga,
  diskon,
  gambar_urls,
}: PropertiMobil) {
  const hargaFinal = diskon > 0 ? harga - (harga * diskon) / 100 : harga;
  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  return (
    <article className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-lg group h-[320px] sm:h-[400px]">
      <img
        src={
          gambar_urls?.[0] ||
          "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?w=800"
        }
        alt={`${merek} ${nama}`}
        className="w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-3 uppercase tracking-wider">
          Pilihan Premium
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {merek} {nama}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">
            {formatRupiah(hargaFinal)}
          </p>
          {diskon > 0 && (
            <del className="text-xs sm:text-sm text-slate-400">
              {formatRupiah(harga)}
            </del>
          )}
        </div>
        <div className="mt-5">
          <Link
            href={`/mobil/${id}`}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            <span>Lihat Penawaran</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

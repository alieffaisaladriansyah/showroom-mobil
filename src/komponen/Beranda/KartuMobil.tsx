import React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

interface PropertiKartuMobil {
  id: string;
  nama: string;
  merek: string;
  harga: number;
  diskon: number;
  gambar: string;
}

export default function KartuMobil({
  id,
  nama,
  merek,
  harga,
  diskon,
  gambar,
}: PropertiKartuMobil) {
  // Hitung harga setelah diskon jika ada
  const hargaFinal = diskon > 0 ? harga - (harga * diskon) / 100 : harga;

  // Format mata uang Rupiah yang bersih
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
      <div>
        {/* Area Gambar Mobil */}
        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden group">
          <img
            src={gambar}
            alt={`${merek} ${nama}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {diskon > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              Hemat {diskon}%
            </span>
          )}
        </div>

        {/* Detail Informasi */}
        <div className="p-5">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              {merek}
            </p>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1">
              {nama}
            </h3>
          </header>

          {/* Area Harga */}
          <div className="mt-4 flex flex-col justify-end min-h-[3rem]">
            {diskon > 0 && (
              <del className="text-xs text-slate-400 block mb-0.5">
                {formatRupiah(harga)}
              </del>
            )}
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatRupiah(hargaFinal)}
            </p>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Lengkap */}
      <div className="px-5 pb-5 pt-2">
        <Link
          href={`/mobil/${id}`}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Eye className="h-4 w-4" />
          <span>Lihat Detail</span>
        </Link>
      </div>
    </article>
  );
}

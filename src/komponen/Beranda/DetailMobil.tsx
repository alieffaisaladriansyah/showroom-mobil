"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Calendar, ShieldCheck, Tag, Phone } from "lucide-react";

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
}

interface MobilProps {
  mobil: Mobil;
}

export default function DetailMobil({ mobil }: Readonly<MobilProps>) {
  const hargaFinal =
    mobil?.diskon > 0
      ? mobil.harga - (mobil.harga * mobil.diskon) / 100
      : mobil.harga;

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  return (
    <section
      className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
      aria-label="Informasi Produk"
    >
      <header>
        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
          {mobil?.merek}
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          {mobil?.nama}
        </h1>
      </header>

      {/* Kotak Harga */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-center">
        {mobil?.diskon > 0 && (
          <div className="flex items-center gap-2 mb-1">
            <del className="text-sm text-slate-400">
              {formatRupiah(mobil.harga)}
            </del>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Tag className="h-3 w-3" /> Hemat {mobil.diskon}%
            </span>
          </div>
        )}
        <p className="text-3xl font-black text-slate-900 tracking-tight">
          {formatRupiah(hargaFinal)}
        </p>
      </div>

      {/* Deskripsi Unit */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
          Deskripsi Kendaraan
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          {mobil?.deskripsi ||
            "Tidak ada deskripsi spesifik mengenai unit ini."}
        </p>
      </div>

      {/* Fitur Istimewa */}
      {mobil?.fitur && mobil.fitur.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Fitur Utama
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {mobil.fitur.map((fiturItem: string, idx: number) => (
              <li
                key={fiturItem ? `${fiturItem}-${idx}` : String(idx)}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="line-clamp-1">{fiturItem}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr className="border-slate-100" />

      {/* Tombol Interaksi Booking & Test Drive */}
      <div className="space-y-3 pt-2">
        <Link
          href={`/daftar?mobilId=${mobil.id}&nama=${encodeURIComponent(
            mobil.nama,
          )}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
        >
          <Calendar className="h-4 w-4" />
          <span>Jadwalkan Test Drive</span>
        </Link>

        <Link
          href={`/daftar?mobilId=${mobil.id}&nama=${encodeURIComponent(
            mobil.nama,
          )}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Booking Unit Sekarang</span>
        </Link>

        <a
          href={`mailto:sales@example.com?subject=Info%20${encodeURIComponent(
            mobil.nama,
          )}`}
          className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
        >
          <Phone className="h-4 w-4" />
          <span>Hubungi Penjual</span>
        </a>
      </div>
    </section>
  );
}

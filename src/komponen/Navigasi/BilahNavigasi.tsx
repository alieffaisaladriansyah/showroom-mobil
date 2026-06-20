"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import KotakPencarian from "./KotakPencarian";

export default function BilahNavigasi() {
  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo Brand Tunggal Tanpa Teks (Ukuran Lebih Besar) */}
          <Link
            href="/"
            className="flex items-center shrink-0 py-2"
            aria-label="Halaman Utama Showroom Mobil"
          >
            <div className="relative h-14 w-36 overflow-hidden">
              <Image
                src="/gambar/logo.png"
                alt="Logo Showroom Mobil"
                fill
                priority
                sizes="(max-width: 768px) 120px, 144px"
                className="object-contain object-left" // Logo rata kiri agar presisi
              />
            </div>
          </Link>

          {/* Searchbar Tengah */}
          <div className="flex-1 max-w-md hidden md:block">
            <KotakPencarian />
          </div>

          {/* Tombol Masuk / Daftar */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/masuk"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

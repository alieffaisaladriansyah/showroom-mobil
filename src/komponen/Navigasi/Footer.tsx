"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const tahunSekarang = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        {/* Informasi Hak Cipta */}
        <p>&copy; {tahunSekarang} DriveCore Showroom. Hak Cipta Dilindungi.</p>

        {/* Navigasi Tambahan */}
        <nav className="flex gap-6" aria-label="Navigasi bagian kaki">
          <Link
            href="/syarat-ketentuan"
            className="hover:text-blue-600 transition-colors"
          >
            Syarat & Ketentuan
          </Link>
          <Link
            href="/kebijakan-privasi"
            className="hover:text-blue-600 transition-colors"
          >
            Kebijakan Privasi
          </Link>
        </nav>
      </div>
    </footer>
  );
}

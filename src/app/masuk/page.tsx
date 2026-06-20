"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogIn, Loader2, Car, AlertCircle } from "lucide-react";

export default function HalamanMasuk() {
  const [email, setEmail] = useState<string>("");
  const [kataSandi, setKataSandi] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [pesanEror, setPesanEror] = useState<string | null>(null);

  // =====================================================================
  // PENYELAMAT AUTH: Dengarkan status login agar cookies sinkron 100%
  // =====================================================================
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Jika event menyatakan berhasil masuk dan sesi terdeteksi valid
      if (event === "SIGNED_IN" && session) {
        // Beri jeda kecil (100ms) agar browser selesai menulis cookie secara fisik
        setTimeout(() => {
          window.location.href = "/admin/mobil";
        }, 100);
      }
    });

    // Bersihkan listener saat komponen dilepas
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const tanganiMasuk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPesanEror(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: kataSandi,
      });

      if (error) {
        throw new Error(
          error.message === "Invalid login credentials"
            ? "Email atau kata sandi yang Anda masukkan salah."
            : error.message,
        );
      }

      // Catatan: Pengalihan halaman tidak ditaruh di sini lagi,
      // melainkan ditangani secara otomatis oleh useEffect onAuthStateChange di atas.
    } catch (err) {
      const pesan =
        err instanceof Error ? err.message : "Terjadi kegagalan proses masuk.";
      setPesanEror(pesan);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <article className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-2xl tracking-tight justify-center">
            <Car className="h-7 w-7 stroke-[2.5]" />
            <span>
              DRIVE<span className="text-white">CORE</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Login Portal Admin
          </h1>
          <p className="text-xs text-slate-400">
            Gunakan akun admin yang terdaftar untuk mengelola inventaris
            showroom
          </p>
        </header>

        {pesanEror && (
          <div
            className="bg-red-950/40 border border-red-900 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs font-medium"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{pesanEror}</span>
          </div>
        )}

        <form onSubmit={tanganiMasuk} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@drivecore.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="sandi"
              className="text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Kata Sandi
            </label>
            <input
              id="sandi"
              type="password"
              required
              placeholder="••••••••"
              value={kataSandi}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setKataSandi(e.target.value)
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors text-sm mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span>Otentikasi Akun</span>
          </button>
        </form>

        <footer className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
          Belum punya kredensial?{" "}
          <Link
            href="/daftar"
            className="text-blue-500 font-bold hover:underline"
          >
            Daftar Di Sini
          </Link>
        </footer>
      </article>
    </main>
  );
}

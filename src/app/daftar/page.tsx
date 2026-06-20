"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UserPlus, Loader2, Car } from "lucide-react";

export default function HalamanDaftar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [pesanEror, setPesanEror] = useState<string | null>(null);

  const tanganiDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesanEror(null);

    const { error } = await supabase.auth.signUp({
      email,
      password: kataSandi,
    });

    if (error) {
      setPesanEror(error.message);
      setLoading(false);
    } else {
      setSukses(true);
      setLoading(false);
      // Opsional: Otomatis lempar ke login setelah jeda jika konfirmasi email dimatikan
      setTimeout(() => router.push("/masuk"), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <article className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tight justify-center">
            <Car className="h-7 w-7 stroke-[2.5]" />
            <span>
              DRIVE<span className="text-slate-800">CORE</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Buat Akun Baru
          </h1>
          <p className="text-xs text-slate-500">
            Daftarkan email Anda untuk mulai menjelajahi fitur showroom
          </p>
        </header>

        {pesanEror && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-xl"
            role="alert"
          >
            {pesanEror}
          </div>
        )}

        {sukses && (
          <div
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium p-3 rounded-xl"
            role="alert"
          >
            Registrasi berhasil! Menghubungkan akun Anda ke halaman login...
          </div>
        )}

        <form onSubmit={tanganiDaftar} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="sandi"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Buat Kata Sandi
            </label>
            <input
              id="sandi"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={kataSandi}
              onChange={(e) => setKataSandi(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || sukses}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors text-sm mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>Daftar Akun</span>
          </button>
        </form>

        <footer className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Sudah memiliki akun?{" "}
          <Link
            href="/masuk"
            className="text-blue-600 font-bold hover:underline"
          >
            Masuk Sekarang
          </Link>
        </footer>
      </article>
    </main>
  );
}

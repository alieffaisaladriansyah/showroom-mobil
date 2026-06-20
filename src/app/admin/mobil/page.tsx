"use client";

/* cspell:disable */
import React, { useState, useEffect } from "react"; // Hapus useCallback karena sudah tidak dibutuhkan
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Trash2,
  Car,
  Loader2,
  X,
  AlertCircle,
  LogOut,
} from "lucide-react";

interface Mobil {
  id: string;
  nama: string;
  merek: string;
  harga: number;
  diskon: number;
  deskripsi: string;
  fitur: string[];
  gambar_urls: string[];
}

export default function PanelAdminMobil() {
  const [listMobil, setListMobil] = useState<Mobil[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tombolLoading, setTombolLoading] = useState<boolean>(false);
  const [modalTerbuka, setModalTerbuka] = useState<boolean>(false);
  const [pesanEror, setPesanEror] = useState<string | null>(null);

  // Form State
  const [merek, setMerek] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [harga, setHarga] = useState<string>("");
  const [diskon, setDiskon] = useState<string>("");
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [inputFitur, setInputFitur] = useState<string>("");
  const [inputGambar, setInputGambar] = useState<string>("");

  // =====================================================================
  // SOLUSI TOTAL REACT 19: Gunakan Pola Fetching di Dalam Efek (Murni Asinkron)
  // =====================================================================
  useEffect(() => {
    let aktif = true; // Flag untuk mencegah balapan data (race condition)

    async function muatDataDuniaNyata() {
      try {
        const { data, error } = await supabase
          .from("mobil")
          .select(
            "id, nama, merek, harga, diskon, deskripsi, fitur, gambar_urls",
          )
          .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);

        // Hanya ubah state jika komponen masih aktif (tidak di-unmount)
        if (aktif && data) {
          const dataTerformat: Mobil[] = data.map((item) => ({
            id: String(item.id),
            nama: String(item.nama || ""),
            merek: String(item.merek || ""),
            harga: Number(item.harga) || 0,
            diskon: Number(item.diskon) || 0,
            deskripsi: String(item.deskripsi || ""),
            fitur: Array.isArray(item.fitur) ? (item.fitur as string[]) : [],
            gambar_urls: Array.isArray(item.gambar_urls)
              ? (item.gambar_urls as string[])
              : [],
          }));

          setListMobil(dataTerformat);
          setPesanEror(null);
        }
      } catch (err) {
        if (aktif) {
          const pesan =
            err instanceof Error ? err.message : "Gagal memuat data.";
          setPesanEror(pesan);
        }
      } finally {
        if (aktif) {
          setLoading(false);
        }
      }
    }

    muatDataDuniaNyata();

    // Fungsi pembersih (cleanup) otomatis dijalankan React jika komponen hancur
    return () => {
      aktif = false;
    };
  }, []); // Array dependensi KOSONG [] memastikan ini HANYA berjalan 1x pas halaman dibuka

  // =====================================================================
  // FUNGSI AKSI (TETAP SAMA SEPERTI SEBELUMNYA TAPI AMAN DARI EFFECT LINT)
  // =====================================================================
  const pemicuRefreshData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("mobil")
        .select("id, nama, merek, harga, diskon, deskripsi, fitur, gambar_urls")
        .order("created_at", { ascending: false });
      if (data) {
        setListMobil(
          data.map((item) => ({
            id: String(item.id),
            nama: String(item.nama || ""),
            merek: String(item.merek || ""),
            harga: Number(item.harga) || 0,
            diskon: Number(item.diskon) || 0,
            deskripsi: String(item.deskripsi || ""),
            fitur: Array.isArray(item.fitur) ? item.fitur : [],
            gambar_urls: Array.isArray(item.gambar_urls)
              ? item.gambar_urls
              : [],
          })),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tanganiTambahMobil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTombolLoading(true);

    const arrayFitur = inputFitur
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f !== "");
    const arrayGambar = inputGambar
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g !== "");

    try {
      const { error } = await supabase.from("mobil").insert([
        {
          merek,
          nama,
          harga: parseFloat(harga) || 0,
          diskon: diskon ? parseFloat(diskon) : 0,
          deskripsi,
          fitur: arrayFitur,
          gambar_urls:
            arrayGambar.length > 0
              ? arrayGambar
              : [
                  "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?w=600",
                ],
        },
      ]);
      if (error) throw new Error(error.message);

      setMerek("");
      setNama("");
      setHarga("");
      setDiskon("");
      setDeskripsi("");
      setInputFitur("");
      setInputGambar("");
      setModalTerbuka(false);
      await pemicuRefreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setTombolLoading(false);
    }
  };

  const tanganiHapusMobil = async (id: string) => {
    if (!confirm("Hapus unit mobil ini dari inventaris?")) return;
    try {
      const { error } = await supabase.from("mobil").delete().eq("id", id);
      if (error) throw new Error(error.message);
      await pemicuRefreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  };

  const tanganiKeluar = async () => {
    await supabase.auth.signOut();
    window.location.href = "/masuk";
  };



  const formatRupiah = (angka: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER PANEL */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-bold tracking-wider text-xs uppercase">
              <Car className="h-4 w-4" /> Panel Manajemen Eksekutif
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-1 text-white">
              Kelola Inventaris Mobil
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setModalTerbuka(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-colors flex-1 sm:flex-initial"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Mobil</span>
            </button>
            <button
              type="button"
              onClick={tanganiKeluar}
              className="inline-flex items-center justify-center bg-slate-800 hover:bg-red-950/40 border border-slate-700 hover:border-red-900 text-slate-300 hover:text-red-400 p-2.5 rounded-xl transition-all"
              title="Keluar dari Panel Admin"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {pesanEror && (
          <div
            className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>
              <span className="font-bold">Koneksi Gagal:</span> {pesanEror}
            </span>
          </div>
        )}

        {/* TABEL INVENTARIS */}
        <section
          aria-label="Katalog Showroom"
          className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm">Menyinkronkan kluster Supabase...</p>
            </div>
          ) : listMobil.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              Belum ada data unit mobil. Silakan klik tombol Tambah Mobil.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4 pl-6">Detail Mobil</th>
                    <th className="p-4">Merek</th>
                    <th className="p-4">Harga Dasar</th>
                    <th className="p-4">Diskon</th>
                    <th className="p-4 pr-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {listMobil.map((mobil) => (
                    <tr
                      key={mobil.id}
                      className="hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="h-10 w-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                          <img
                            src={
                              mobil.gambar_urls?.[0] ||
                              "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?w=100"
                            }
                            alt={mobil.nama}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-white">
                          {mobil.nama}
                        </span>
                      </td>
                      <td className="p-4 uppercase tracking-wider text-xs font-medium text-slate-400">
                        {mobil.merek}
                      </td>
                      <td className="p-4 font-medium">
                        {formatRupiah(mobil.harga)}
                      </td>
                      <td className="p-4">
                        {mobil.diskon > 0 ? (
                          <span className="bg-red-950/50 border border-red-800 text-red-400 px-2 py-0.5 rounded text-xs font-bold">
                            {mobil.diskon}%
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => tanganiHapusMobil(mobil.id)}
                          className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* DIALOG FORM MODAL */}
        {modalTerbuka && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <dialog
              open
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl block overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
                <h2 className="text-xl font-bold text-white">
                  Input Unit Baru
                </h2>
                <button
                  type="button"
                  onClick={() => setModalTerbuka(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={tanganiTambahMobil}
                className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Merek
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Hyundai"
                      value={merek}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMerek(e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Nama / Seri
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ioniq 5"
                      value={nama}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNama(e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Harga Dasar
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="750000000"
                      value={harga}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setHarga(e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Diskon (%)
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      value={diskon}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDiskon(e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Deskripsi
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Kondisi baru..."
                    value={deskripsi}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDeskripsi(e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Fitur (Pisahkan dengan koma `,`)
                  </label>
                  <input
                    type="text"
                    placeholder="Autopilot, AWD, Sunroof"
                    value={inputFitur}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInputFitur(e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    URL Gambar (Pisahkan dengan koma `,` jika banyak)
                  </label>
                  <input
                    type="text"
                    placeholder="https://link1.com, https://link2.com"
                    value={inputGambar}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInputGambar(e.target.value)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalTerbuka(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={tombolLoading}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all min-w-[120px]"
                  >
                    {tombolLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Simpan</span>
                    )}
                  </button>
                </div>
              </form>
            </dialog>
          </div>
        )}
      </div>
    </main>
  );
}

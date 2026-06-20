"use client";

/* cspell:disable */
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Trash2,
  Car,
  Loader2,
  X,
  AlertCircle,
  LogOut,
  Upload,
  ImageIcon,
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
  banner_url?: string | null;
}

interface Banner {
  id: number;
  gambar_url?: string | null;
  judul?: string | null;
  aktif?: boolean;
  urutan?: number;
}

const MEREK_LIST = [
  "Toyota",
  "Honda",
  "Suzuki",
  "Daihatsu",
  "Mitsubishi",
  "Nissan",
  "Mazda",
  "Hyundai",
  "Kia",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Lexus",
  "Volkswagen",
  "Ford",
  "Chevrolet",
  "Isuzu",
  "Wuling",
  "DFSK",
  "Chery",
];

export default function PanelAdminMobil() {
  const [activeTab, setActiveTab] = useState<"mobil" | "banner">("mobil");

  // Banner manager state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState<boolean>(true);
  const [bannerJudul, setBannerJudul] = useState<string>("");
  const [bannerTombolLoading, setBannerTombolLoading] =
    useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function loadBanners() {
      try {
        const { data } = await supabase
          .from("banners")
          .select("id, gambar_url, judul, aktif, urutan")
          .order("urutan", { ascending: true });
        if (mounted && data) setBanners(data as Banner[]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoadingBanners(false);
      }
    }
    loadBanners();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshBanners = async () => {
    setLoadingBanners(true);
    try {
      const { data } = await supabase
        .from("banners")
        .select("id, gambar_url, judul, aktif, urutan")
        .order("urutan", { ascending: true });
      if (data) setBanners(data as Banner[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBanners(false);
    }
  };

  const handleAddBanner = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBannerTombolLoading(true);
    try {
      if (!localBannerFile)
        throw new Error("Pilih file banner terlebih dahulu");

      // Preflight: cek apakah bucket 'banners' ada supaya error lebih jelas
      try {
        const { error: listErr } = await supabase.storage
          .from("banners")
          .list("", { limit: 1 });
        if (listErr) {
          // Roda error handling di luar untuk konsistensi
          throw listErr;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const lower = msg.toLowerCase();
        if (
          lower.includes("bucket") &&
          (lower.includes("not found") ||
            lower.includes("does not exist") ||
            lower.includes("not exist") ||
            lower.includes("no such bucket"))
        ) {
          const help =
            "Bucket 'banners' tidak ditemukan di proyek Supabase Anda. " +
            "Silakan buat bucket bernama 'banners' di Supabase Dashboard → Storage → Buckets (set Public jika ingin akses publik).";
          setPesanEror(help);
          alert(help);
          setBannerTombolLoading(false);
          return;
        }
        // jika bukan bucket error, lanjutkan untuk ditangani di catch utama
        throw e;
      }

      // Use a stable random id for filename to avoid lint rule on impure Date.now
      const filePath = `banners/${crypto.randomUUID()}_${localBannerFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(filePath, localBannerFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { error } = await supabase
        .from("banners")
        .insert([
          { gambar_url: publicUrl, judul: bannerJudul || null, aktif: true },
        ]);
      if (error) throw new Error(error.message);

      setBannerJudul("");
      setPreviewBanner(null);
      setLocalBannerFile(null);
      await refreshBanners();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const lower = msg.toLowerCase();
      // Detect row-level security policy violation and give actionable SQL
      if (
        lower.includes("violates row-level") ||
        lower.includes("row-level security")
      ) {
        const help =
          "Insert gagal karena Row Level Security (RLS) pada tabel 'banners'.\n" +
          "Jalankan SQL berikut di Supabase SQL editor untuk mengizinkan insert oleh pengguna terautentikasi:\n\n" +
          "-- Aktifkan RLS jika belum\n" +
          "ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;\n\n" +
          "-- Izinkan pengguna authenticated melakukan INSERT\n" +
          "CREATE POLICY allow_authenticated_insert ON public.banners\n" +
          "  FOR INSERT\n" +
          "  TO authenticated\n" +
          "  USING (true)\n" +
          "  WITH CHECK (true);\n\n" +
          "Jika Anda ingin juga mengizinkan UPDATE/DELETE, tambahkan policy yang sesuai.";
        setPesanEror(help);
        alert(help);
        return;
      }
      // Detect common bucket-not-found messages and show actionable instruction
      if (
        lower.includes("bucket") &&
        (lower.includes("not found") ||
          lower.includes("does not exist") ||
          lower.includes("not exist") ||
          lower.includes("no such bucket"))
      ) {
        const help =
          "Bucket 'banners' tidak ditemukan di proyek Supabase Anda. " +
          "Silakan buat bucket bernama 'banners' di Supabase Dashboard → Storage → Buckets (set Public jika ingin akses publik).";
        setPesanEror(help);
        alert(help);
      } else {
        alert(msg || "Gagal menambah banner");
      }
    } finally {
      setBannerTombolLoading(false);
    }
  };

  const handleToggleBanner = async (id: number, aktif: boolean) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ aktif: !aktif })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await refreshBanners();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengupdate banner");
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw new Error(error.message);
      await refreshBanners();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus banner");
    }
  };
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
  const [previewGambar, setPreviewGambar] = useState<string[]>([]);
  const [, setLocalFiles] = useState<File[]>([]);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [localBannerFile, setLocalBannerFile] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let aktif = true;
    async function muatDataDuniaNyata() {
      try {
        const { data, error } = await supabase
          .from("mobil")
          .select(
            "id, nama, merek, harga, diskon, deskripsi, fitur, gambar_urls, banner_url",
          )
          .order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
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
            banner_url: item.banner_url ? String(item.banner_url) : null,
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
        if (aktif) setLoading(false);
      }
    }
    muatDataDuniaNyata();
    return () => {
      aktif = false;
    };
  }, []);

  const pemicuRefreshData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("mobil")
        .select(
          "id, nama, merek, harga, diskon, deskripsi, fitur, gambar_urls, banner_url",
        )
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
            banner_url: item.banner_url ? String(item.banner_url) : null,
          })),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLocalFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewGambar((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalBannerFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewBanner((ev.target?.result as string) || null);
    };
    reader.readAsDataURL(file);
  };

  const hapusPreview = (index: number) => {
    setPreviewGambar((prev) => prev.filter((_, i) => i !== index));
    setLocalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const hapusBannerPreview = () => {
    setPreviewBanner(null);
    setLocalBannerFile(null);
  };

  const resetForm = () => {
    setMerek("");
    setNama("");
    setHarga("");
    setDiskon("");
    setDeskripsi("");
    setInputFitur("");
    setInputGambar("");
    setPreviewGambar([]);
    setLocalFiles([]);
    setPreviewBanner(null);
    setLocalBannerFile(null);
    setBannerUrl("");
  };

  const tanganiTambahMobil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTombolLoading(true);
    const arrayFitur = inputFitur
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    const arrayGambarUrl = inputGambar
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
    // Gabungkan: preview base64 dari file lokal + URL manual
    const semuaGambar = [...previewGambar, ...arrayGambarUrl];
    try {
      const { error } = await supabase.from("mobil").insert([
        {
          merek,
          nama,
          harga: Number.parseFloat(harga) || 0,
          diskon: diskon ? Number.parseFloat(diskon) : 0,
          deskripsi,
          fitur: arrayFitur,
          gambar_urls:
            semuaGambar.length > 0
              ? semuaGambar
              : [
                  "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?w=600",
                ],
          banner_url: bannerUrl ?? null,
        },
      ]);
      if (error) throw new Error(error.message);
      resetForm();
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
    globalThis.location.href = "/masuk";
  };

  const formatRupiah = (angka: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* TOP NAV */}
      <header>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[11px] font-semibold text-gray-900 uppercase">
                  Admin Panel
                </p>
                <p className="text-base font-bold text-gray-900 leading-tight">
                  Manajemen Inventaris
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalTerbuka(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                Tambah Mobil
              </button>
              <button
                type="button"
                onClick={tanganiKeluar}
                title="Keluar"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Panel</h3>
            <nav className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("mobil")}
                className={`text-left px-3 py-2 rounded-md ${activeTab === "mobil" ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Manajemen Mobil
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("banner")}
                className={`text-left px-3 py-2 rounded-md ${activeTab === "banner" ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Manajemen Banner
              </button>
            </nav>
          </aside>

          {/* Content area */}
          <section className="lg:col-span-3">
            {/* STATS ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Unit",
                  value: listMobil.length,
                  color: "text-blue-600",
                },
                {
                  label: "Merek Tersedia",
                  value: new Set(listMobil.map((m) => m.merek)).size,
                  color: "text-violet-600",
                },
                {
                  label: "Ada Diskon",
                  value: listMobil.filter((m) => m.diskon > 0).length,
                  color: "text-emerald-600",
                },
                {
                  label: "Harga Tertinggi",
                  value: listMobil.length
                    ? formatRupiah(Math.max(...listMobil.map((m) => m.harga)))
                    : "—",
                  color: "text-orange-500",
                  small: true,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p
                    className={`mt-1 font-bold ${stat.small ? "text-lg" : "text-2xl"} ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ERROR */}
            {pesanEror && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                <span>
                  <span className="font-semibold">Koneksi Gagal:</span>{" "}
                  {pesanEror}
                </span>
              </div>
            )}

            {/* Conditional tab content */}
            {activeTab === "banner" ? (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900">
                  Manajemen Banner
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Unggah banner dari file lokal; file akan diunggah ke bucket
                  &apos;banners&apos; dan URL disimpan ke tabel.
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-500">
                    Judul (opsional)
                  </label>
                  <input
                    value={bannerJudul}
                    onChange={(e) => setBannerJudul(e.target.value)}
                    className="w-full mt-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />

                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-500">
                      Pilih file banner
                    </label>
                    <div
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer"
                    >
                      <Upload className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Klik untuk pilih file PNG/JPG/WEBP
                      </p>
                    </div>
                    <input
                      ref={bannerFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setLocalBannerFile(f);
                          const r = new FileReader();
                          r.onload = (ev) =>
                            setPreviewBanner(
                              (ev.target?.result as string) || null,
                            );
                          r.readAsDataURL(f);
                        }
                      }}
                    />
                    {previewBanner && (
                      <div className="mt-3 rounded overflow-hidden border border-gray-200">
                        <img
                          src={previewBanner}
                          alt="preview"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleAddBanner()}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Tambahkan Banner
                      </button>
                      <button
                        onClick={() => {
                          setPreviewBanner(null);
                          setLocalBannerFile(null);
                          setBannerJudul("");
                        }}
                        className="text-sm text-gray-500"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Daftar Banner
                    </h3>
                    {loadingBanners ? (
                      <p className="text-sm text-gray-400">Memuat…</p>
                    ) : banners.length === 0 ? (
                      <p className="text-sm text-gray-400">Belum ada banner</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {banners.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between border border-gray-100 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-28 h-14 bg-gray-100 overflow-hidden rounded-md">
                                {b.gambar_url ? (
                                  <img
                                    src={b.gambar_url}
                                    alt={b.judul || "banner"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {b.judul || "-"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {b.aktif ? "Aktif" : "Non-aktif"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleToggleBanner(b.id, b.aktif)
                                }
                                className="text-sm text-blue-600"
                              >
                                {b.aktif ? "Non-aktifkan" : "Aktifkan"}
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(b.id)}
                                className="text-sm text-red-600"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              // Mobil tab
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Daftar Unit Mobil
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {listMobil.length} unit tercatat di inventaris
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                    <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                    <p className="text-sm">Memuat data inventaris…</p>
                  </div>
                ) : listMobil.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                    <Car className="h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium">Belum ada unit mobil</p>
                    <p className="text-xs text-gray-300">
                      Klik Tambah Mobil untuk mulai mengisi inventaris
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          <th className="px-6 py-3">Unit Mobil</th>
                          <th className="px-4 py-3">Merek</th>
                          <th className="px-4 py-3">Harga</th>
                          <th className="px-4 py-3">Diskon</th>
                          <th className="px-4 py-3">Fitur</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {listMobil.map((mobil) => (
                          <tr
                            key={mobil.id}
                            className="hover:bg-gray-50/80 transition-colors group"
                          >
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                  {mobil.gambar_urls?.[0] ? (
                                    <img
                                      src={mobil.gambar_urls[0]}
                                      alt={mobil.nama}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="h-5 w-5 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {mobil.nama}
                                  </p>
                                  {mobil.deskripsi && (
                                    <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">
                                      {mobil.deskripsi}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide">
                                {mobil.merek}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-sm font-semibold text-gray-800">
                                {formatRupiah(mobil.harga)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {mobil.diskon > 0 ? (
                                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md">
                                  -{mobil.diskon}%
                                </span>
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {mobil.fitur.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {mobil.fitur.slice(0, 3).map((f) => (
                                    <span
                                      key={f}
                                      className="bg-blue-50 text-blue-600 text-[10px] font-medium px-1.5 py-0.5 rounded"
                                    >
                                      {f}
                                    </span>
                                  ))}
                                  {mobil.fitur.length > 3 && (
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      +{mobil.fitur.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => tanganiHapusMobil(mobil.id)}
                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Hapus unit"
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
            )}
          </section>
        </div>
      </div>

      {/* MODAL - dipindahkan ke luar dari struktur grid */}
      {modalTerbuka && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Overlay klik untuk tutup */}
          <div
            className="absolute inset-0"
            onClick={() => {
              setModalTerbuka(false);
              resetForm();
            }}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Tambah Unit Baru
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Isi detail unit mobil yang akan ditambahkan
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalTerbuka(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <form
              onSubmit={tanganiTambahMobil}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Merek + Nama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Merek <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={merek}
                      onChange={(e) => setMerek(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Pilih merek…
                      </option>
                      {MEREK_LIST.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nama / Seri <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ioniq 5"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Harga + Diskon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Harga Dasar (Rp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        required
                        placeholder="750.000.000"
                        value={harga}
                        onChange={(e) => setHarga(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    {harga && (
                      <p className="text-xs text-blue-500 font-medium">
                        {formatRupiah(Number.parseFloat(harga) || 0)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Diskon (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={diskon}
                        onChange={(e) => setDiskon(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 pr-8 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Kondisi baru, kilometer rendah…"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Fitur */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fitur{" "}
                    <span className="text-gray-300 font-normal normal-case">
                      (pisahkan dengan koma)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Autopilot, AWD, Sunroof, Blind Spot Monitor"
                    value={inputFitur}
                    onChange={(e) => setInputFitur(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {inputFitur && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {inputFitur
                        .split(",")
                        .map((f) => f.trim())
                        .filter(Boolean)
                        .map((f) => (
                          <span
                            key={f}
                            className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-md"
                          >
                            {f}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Upload Gambar */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Foto Mobil
                  </label>

                  {/* Banner URL input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      URL Banner (opsional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Drag & Drop Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-5 text-center cursor-pointer transition-colors group"
                  >
                    <Upload className="h-7 w-7 text-gray-300 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                    <p className="text-sm font-medium text-gray-500 group-hover:text-blue-500 transition-colors">
                      Klik untuk unggah foto
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      JPG, PNG, WEBP — bisa lebih dari 1 foto
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Preview Grid */}
                  {previewGambar.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {previewGambar.map((src, i) => (
                        <div
                          key={i}
                          className="relative group/img rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100"
                        >
                          <img
                            src={src}
                            alt={`preview-${i}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => hapusPreview(i)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL Manual */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs text-gray-400">
                      atau tambahkan URL gambar (pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      placeholder="https://link1.com/foto.jpg, https://link2.com/foto.jpg"
                      value={inputGambar}
                      onChange={(e) => setInputGambar(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer — fixed */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setModalTerbuka(false);
                    resetForm();
                  }}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={tombolLoading}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-all min-w-[120px] shadow-sm"
                >
                  {tombolLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
                    </>
                  ) : (
                    "Simpan Unit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

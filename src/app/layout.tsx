import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BilahNavigasi from "@/komponen/Navigasi/BilahNavigasi";
import Footer from "@/komponen/Navigasi/Footer";

// Mengatur Google Font Inter dengan performa optimal (anti-layout-shift)
const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Metadata SEO Tingkat Global
export const metadata: Metadata = {
  title: "Showroom Mobil",
  description:
    "Temukan mobil impian Anda dengan platform modern. Layanan test drive praktis, transparan, dan terpercaya.",
  keywords: ["showroom mobil", "beli mobil", "test drive", "mobil baru"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fontInter.variable}`}>
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-950 antialiased">
        {/* 1. Header: Navigasi Utama */}
        <header role="banner" className="sticky top-0 z-50 bg-white">
          <BilahNavigasi />
        </header>

        {/* 2. Konten Halaman Dinamis */}
        <div className="flex-grow">{children}</div>

        {/* 3. Footer: Kaki Halaman */}
        <Footer />
      </body>
    </html>
  );
}

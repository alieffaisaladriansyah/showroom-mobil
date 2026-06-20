"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

export default function KotakPencarian() {
  const [kataKunci, setKataKunci] = useState("");

  const tanganiPencarian = (e: React.FormEvent) => {
    e.preventDefault();
    // Logika pencarian mobil akan diarahkan ke url query nantinya
    console.log("Mencari mobil:", kataKunci);
  };

  return (
    <form onSubmit={tanganiPencarian} className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Cari mobil impian Anda... (e.g. SUV, Hybrid)"
        value={kataKunci}
        onChange={(e) => setKataKunci(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-slate-100 text-slate-800 placeholder-slate-400 text-sm rounded-lg border border-transparent focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-200"
      />
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
    </form>
  );
}

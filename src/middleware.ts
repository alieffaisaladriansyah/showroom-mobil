import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // 1. Buat respons awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // 2. Inisialisasi SSR Client khusus middleware untuk membaca & menulis cookies browser
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Update cookie pada request agar server component di rute tujuan bisa membacanya
        request.cookies.set({ name, value, ...options });
        // Buat ulang objek response untuk mengaplikasikan set-cookie ke browser
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // =====================================================================
  // PERBAIKAN UTAMA: Menggunakan getUser() bukan getSession() demi keamanan
  // =====================================================================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Proteksi 1: Jika mencoba masuk ke area /admin tapi belum login -> Tendang ke /masuk
  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }

  // Proteksi 2: Jika sudah login tapi coba buka halaman /masuk atau /daftar -> Lempar langsung ke dashboard admin
  if (user && (pathname === "/masuk" || pathname === "/daftar")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/mobil";
    return NextResponse.redirect(url);
  }

  return response;
}

// Menentukan rute mana saja yang akan dilewati oleh filter middleware ini
export const config = {
  matcher: ["/admin/:path*", "/masuk", "/daftar"],
};

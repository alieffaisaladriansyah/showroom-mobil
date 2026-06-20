import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let response: NextResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey: string =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Inisialisasi SSR Client khusus middleware untuk membaca cookies browser
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
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

  // Ambil sesi aktif saat ini
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // Proteksi 1: Jika ke area /admin tapi belum login -> Tendang ke /masuk
  if (pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }

  // Proteksi 2: Jika sudah login tapi coba buka /masuk atau /daftar -> Lempar ke dashboard admin
  if (session && (pathname === "/masuk" || pathname === "/daftar")) {
    return NextResponse.redirect(new URL("/admin/mobil", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/masuk", "/daftar"],
};

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "플랜두씨 다이어리",
  description: "Plan → Do → See 다이어리",
};

const nav = [
  { href: "/", label: "홈" },
  { href: "/plans", label: "계획" },
  { href: "/review", label: "돌아보기" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900`}
      >
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <a href="/" className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  P
                </span>
                <div>
                  <p className="text-sm font-bold tracking-tight">플랜두씨 다이어리</p>
                  <p className="text-xs text-slate-500">Plan → Do → See</p>
                </div>
              </a>

              <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>

          <footer className="border-t border-slate-200/70 py-8 text-center text-xs text-slate-500">
            로그인 없이 동작하는 공개 다이어리 · 민감 정보는 넣지 마세요
          </footer>
        </div>
      </body>
    </html>
  );
}
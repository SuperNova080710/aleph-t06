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
  title: "계획 다이어리",
  description: "Plan → Do → See 다이어리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <h1 className="text-lg font-bold tracking-tight">
                계획 다이어리
              </h1>
              <nav className="flex gap-4 text-sm text-zinc-600">
                <a href="/" className="hover:text-zinc-900">
                  홈
                </a>
                <a href="/plans" className="hover:text-zinc-900">
                  계획
                </a>
                <a href="/review" className="hover:text-zinc-900">
                  돌아보기
                </a>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin", "latin-ext"],
  variable: "--font-story",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seybo – Rozprávky pre deti",
  description: "Generuj osobné rozprávky s menami vašich detí, témou a ponaučením.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={quicksand.variable}>
      <body className={`min-h-screen font-story bg-gradient-to-br from-fairy-sky via-fairy-dusk to-fairy-lavender stars-bg ${quicksand.className}`}>
        {/* Dekoratívne zaoblené tvary */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-fairy-violet/20 blur-3xl animate-float" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-fairy-lavender/25 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-fairy-3xl bg-fairy-purple/15 blur-2xl" />
        </div>

        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}

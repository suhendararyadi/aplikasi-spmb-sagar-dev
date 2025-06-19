// PERHATIAN: Perbarui file ini di `app/layout.tsx`.
// Perubahan utama: Mengubah defaultTheme menjadi 'light'.

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "SPMB - SMKN 9 Garut",
  description: "Sistem Penerimaan Murid Baru dan Pendaftaran Ulang SMKN 9 Garut",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          // --- PERUBAHAN DI SINI ---
          // Mengubah tema default dari "system" menjadi "light".
          defaultTheme="light"
          // --- AKHIR PERUBAHAN ---
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

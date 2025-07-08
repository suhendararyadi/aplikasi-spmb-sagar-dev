// PERHATIAN: Buat file baru ini di `components/spmb-hero.tsx`.
// Jangan lupa hapus file `components/hero.tsx` yang lama.

import { Button } from "./ui/button";
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";

export function SpmbHero() {
  return (
    <div className="flex flex-col gap-8 items-center text-center py-16 md:py-24">
      <h1 className="text-4xl lg:text-5xl font-bold !leading-tight tracking-tighter">
        Sistem Penerimaan Murid Baru (SPMB)
        <br />
        <span className="text-primary">SMKN 9 Garut</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Selamat datang di Sistem Penerimaan Murid Baru (SPMB) bagi Calon Murid Baru
        SMKN 9 Garut. Silakan login menggunakan akun yang telah diberikan untuk melanjutkan proses.
      </p>
      <div className="flex gap-4 mt-4">
        <Button asChild size="lg">
          {/* <Link href="/auth/login">
            Login Sekarang <ArrowRight className="ml-2 h-5 w-5" />
          </Link> */}
        </Button>
      </div>
    </div>
  );
}

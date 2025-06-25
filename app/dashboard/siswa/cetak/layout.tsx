// PERHATIAN: Buat file baru ini.
// File ini akan menjadi layout khusus untuk halaman cetak,
// memastikan tidak ada header atau footer aplikasi yang ikut tercetak.

export default function CetakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Kita sengaja tidak menambahkan komponen <nav> atau <footer> di sini.
    // Kita hanya merender konten dari halaman cetak itu sendiri (`page.tsx`),
    // sehingga menghasilkan halaman yang bersih dan siap cetak.
    <>{children}</>
  );
}

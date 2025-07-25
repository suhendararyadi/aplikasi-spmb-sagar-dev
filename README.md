# Aplikasi SPMB SMKN 9 Garut

Aplikasi web untuk Sistem Penerimaan Murid Baru (SPMB) dan Pendaftaran Ulang Siswa di SMKN 9 Garut. Dibangun menggunakan Next.js, Supabase, dan Tailwind CSS.

---

## Fitur Utama

Aplikasi ini memiliki dua peran utama: **Siswa** dan **Admin**, dengan fungsionalitas yang berbeda untuk masing-masing peran.

### Panel Siswa

-   **Login Aman**: Siswa login menggunakan Nomor Pendaftaran dan password yang telah ditentukan oleh admin.
-   **Formulir Pendaftaran Ulang**: Setelah login, siswa dapat mengisi dan memperbarui formulir pendaftaran ulang yang berisi data pribadi, asal sekolah, pilihan jurusan, dan konfirmasi.
-   **Ringkasan Data**: Setelah data disimpan, siswa akan melihat ringkasan dari data yang telah mereka kirimkan.
-   **Mode Edit**: Siswa dapat mengubah kembali data mereka selama periode pendaftaran ulang masih dibuka.

### Panel Admin

-   **Dashboard Statistik**: Menampilkan ringkasan data pendaftar dalam bentuk kartu (Total Pendaftar, Sudah Daftar Ulang, Belum Daftar Ulang, Persentase Selesai).
-   **Tabel Data Lengkap**: Menampilkan rekapan semua data siswa dalam bentuk tabel yang interaktif.
-   **Fitur Tabel Lanjutan**:
    -   **Pencarian**: Mencari siswa berdasarkan nama.
    -   **Filter**: Memfilter data siswa berdasarkan Program Keahlian dan Status Formulir.
    -   **Ekspor Data**: Mengunduh data yang ditampilkan di tabel ke dalam format **Excel (.xlsx)** atau **PDF (.pdf)**.
-   **Manajemen Pengguna**:
    -   **Tambah Pengguna Manual**: Admin dapat menambahkan akun siswa satu per satu melalui formulir.
    -   **Impor Massal**: Admin dapat membuat ratusan akun siswa sekaligus dengan mengunggah file **CSV**.
    -   **Template CSV**: Disediakan tombol untuk mengunduh template CSV agar format data selalu benar.

### Teknologi yang Digunakan

-   **Framework**: [Next.js](https://nextjs.org) (App Router)
-   **Backend & Database**: [Supabase](https://supabase.com) (Authentication, PostgreSQL, Storage)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com)
-   **Komponen UI**: [shadcn/ui](https://ui.shadcn.com/)
-   **Hosting**: [Vercel](https://vercel.com)

---

## Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer Anda.

1.  **Clone Repositori**
    Gunakan `git clone` untuk mengunduh repositori ini ke mesin lokal Anda.

2.  **Buat Proyek Supabase**
    Anda memerlukan proyek Supabase. Buat proyek baru melalui [Supabase Dashboard](https://database.new).

3.  **Konfigurasi Environment Variables**
    -   Salin file `.env.example` menjadi `.env.local`.
    -   Isi variabel berikut dengan kunci dari proyek Supabase Anda (dapat ditemukan di **Project Settings -> API**):
        -   `NEXT_PUBLIC_SUPABASE_URL`
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   Tambahkan juga `SUPABASE_SERVICE_ROLE_KEY` (dapat ditemukan di tempat yang sama, di bawah "Project API keys") untuk fungsionalitas admin.

4.  **Instal Dependencies**
    Buka terminal di direktori proyek dan jalankan:
    ```bash
    npm install
    ```

5.  **Setup Database**
    -   Buka **SQL Editor** di dashboard Supabase Anda.
    -   Jalankan skrip SQL yang ada di dalam proyek untuk membuat tabel `profiles` dan mengatur keamanannya.

6.  **Jalankan Server Development**
    ```bash
    npm run dev
    ```
    Aplikasi sekarang seharusnya berjalan di <http://localhost:3000>.

---

## Deploy ke Vercel

1.  Pastikan kode Anda sudah di-push ke repositori GitHub.
2.  Impor proyek Anda di [Vercel](https://vercel.com/new).
3.  Konfigurasikan **Environment Variables** di pengaturan proyek Vercel. Pastikan untuk menambahkan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY`.
4.  Klik **Deploy**.

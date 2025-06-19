Aplikasi SPMB SMKN 9 Garut
Aplikasi web untuk Sistem Penerimaan Murid Baru (SPMB) dan Pendaftaran Ulang Siswa di SMKN 9 Garut. Dibangun menggunakan Next.js, Supabase, dan Tailwind CSS.

Fitur Utama
Aplikasi ini memiliki dua peran utama: Siswa dan Admin, dengan fungsionalitas yang berbeda untuk masing-masing peran.

Panel Siswa
Login Aman: Siswa login menggunakan Nomor Pendaftaran dan password yang telah ditentukan oleh admin.

Formulir Pendaftaran Ulang: Setelah login, siswa dapat mengisi dan memperbarui formulir pendaftaran ulang yang berisi data pribadi, asal sekolah, pilihan jurusan, dan konfirmasi.

Ringkasan Data: Setelah data disimpan, siswa akan melihat ringkasan dari data yang telah mereka kirimkan.

Mode Edit: Siswa dapat mengubah kembali data mereka selama periode pendaftaran ulang masih dibuka.

Panel Admin
Dashboard Statistik: Menampilkan ringkasan data pendaftar dalam bentuk kartu (Total Pendaftar, Sudah Daftar Ulang, Belum Daftar Ulang, Persentase Selesai).

Tabel Data Lengkap: Menampilkan rekapan semua data siswa dalam bentuk tabel yang interaktif.

Fitur Tabel Lanjutan:

Pencarian: Mencari siswa berdasarkan nama.

Filter: Memfilter data siswa berdasarkan Program Keahlian dan Status Formulir.

Ekspor Data: Mengunduh data yang ditampilkan di tabel ke dalam format Excel (.xlsx) atau PDF (.pdf).

Manajemen Pengguna:

Tambah Pengguna Manual: Admin dapat menambahkan akun siswa satu per satu melalui formulir.

Impor Massal: Admin dapat membuat ratusan akun siswa sekaligus dengan mengunggah file CSV.

Template CSV: Disediakan tombol untuk mengunduh template CSV agar format data selalu benar.

Teknologi yang Digunakan
Framework: Next.js (App Router)

Backend & Database: Supabase (Authentication, PostgreSQL, Storage)

Styling: Tailwind CSS

Komponen UI: shadcn/ui

Hosting: Vercel

Menjalankan Proyek Secara Lokal
Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer Anda.

Clone Repositori
Gunakan git clone untuk mengunduh repositori ini ke mesin lokal Anda.

Buat Proyek Supabase
Anda memerlukan proyek Supabase. Buat proyek baru melalui Supabase Dashboard.

Konfigurasi Environment Variables

Salin file .env.example menjadi .env.local.

Isi variabel berikut dengan kunci dari proyek Supabase Anda (dapat ditemukan di Project Settings -> API):

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Tambahkan juga SUPABASE_SERVICE_ROLE_KEY (dapat ditemukan di tempat yang sama, di bawah "Project API keys") untuk fungsionalitas admin.

Instal Dependencies
Buka terminal di direktori proyek dan jalankan:

npm install

Setup Database

Buka SQL Editor di dashboard Supabase Anda.

Jalankan skrip SQL yang ada di dalam proyek untuk membuat tabel profiles dan mengatur keamanannya.

Jalankan Server Development

npm run dev

Aplikasi sekarang seharusnya berjalan di http://localhost:3000.

Deploy ke Vercel
Pastikan kode Anda sudah di-push ke repositori GitHub.

Impor proyek Anda di Vercel.

Konfigurasikan Environment Variables di pengaturan proyek Vercel. Pastikan untuk menambahkan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY.

Klik Deploy.
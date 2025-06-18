// PERHATIAN: Perbarui file ini di `components/data-table-toolbar.tsx`.
// Perubahan: Menghilangkan tipe 'any' dan properti 'data' yang tidak digunakan.

"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, SlidersHorizontal } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Definisikan tipe untuk kolom-kolom yang akan diekspor
type ExportableColumn = 'registration_number' | 'full_name' | 'school_origin' | 'accepted_major' | 'status' | 'is_reconfirm' | 'entry_path';

// Buat tipe agar jsPDF-autotable mengenali 'autoTable'
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: Record<string, unknown>) => jsPDF;
}

// --- PERBAIKAN WARNING: Hapus prop 'data' yang tidak digunakan ---
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

// --- PERBAIKAN WARNING: Definisikan tipe yang lebih spesifik daripada 'any' ---
type ProfileRow = Record<ExportableColumn, string | boolean | null | undefined>;


export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  
  // Fungsi untuk mengekspor data ke Excel
  const handleExportExcel = () => {
    const tableData = table.getFilteredRowModel().rows.map(row => {
        // --- PERBAIKAN WARNING: Gunakan tipe ProfileRow yang spesifik ---
        const original = row.original as ProfileRow;
        return {
            "No. Pendaftaran": original.registration_number,
            "Nama Lengkap": original.full_name,
            "Asal Sekolah": original.school_origin,
            "Jalur Masuk": original.entry_path,
            "Program Keahlian": original.accepted_major,
            "Status Formulir": original.status === 'selesai' ? 'Selesai' : 'Belum Mengisi',
            "Konfirmasi": original.is_reconfirm === null ? '-' : (original.is_reconfirm ? 'Ya' : 'Tidak'),
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
    XLSX.writeFile(workbook, "rekap_data_siswa.xlsx");
  };

  // Fungsi untuk mengekspor data ke PDF
  const handleExportPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.text("Rekapan Data Siswa Daftar Ulang", 14, 15);

    const tableData = table.getFilteredRowModel().rows.map(row => {
        // --- PERBAIKAN WARNING: Gunakan tipe ProfileRow yang spesifik ---
        const original = row.original as ProfileRow;
        return [
            original.registration_number,
            original.full_name,
            original.accepted_major,
            original.status === 'selesai' ? 'Selesai' : 'Belum',
            original.is_reconfirm === null ? '-' : (original.is_reconfirm ? 'Ya' : 'Tidak'),
        ];
    });

    doc.autoTable({
      startY: 20,
      head: [['No. Pendaftaran', 'Nama Lengkap', 'Program Keahlian', 'Status', 'Konfirmasi']],
      body: tableData,
    });

    doc.save('rekap_data_siswa.pdf');
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Cari berdasarkan nama siswa..."
          value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("full_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* Dropdown untuk filter Program Keahlian */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-2">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filter Jurusan
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>Pilih Program Keahlian</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['DPIB', 'TEI', 'TITL', 'TKRO', 'TKJ', 'DKV'].map(major => (
                    <DropdownMenuCheckboxItem
                        key={major}
                        className="capitalize"
                        checked={table.getColumn("accepted_major")?.getFilterValue() === major}
                        onCheckedChange={(value) => {
                            const currentFilter = table.getColumn("accepted_major")?.getFilterValue();
                            if (currentFilter === major && !value) {
                                table.getColumn("accepted_major")?.setFilterValue(undefined);
                            } else {
                                table.getColumn("accepted_major")?.setFilterValue(major);
                            }
                        }}
                    >
                        {major}
                    </DropdownMenuCheckboxItem>
                ))}
                 <DropdownMenuSeparator />
                 <DropdownMenuCheckboxItem onCheckedChange={() => table.getColumn("accepted_major")?.setFilterValue(undefined)}>
                    Reset Filter
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Tombol Ekspor */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Ekspor Data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportExcel}>
            Ekspor ke Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPdf}>
            Ekspor ke PDF (.pdf)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// PERHATIAN: Perbarui file ini di `components/data-table-toolbar.tsx`.
// Menambahkan kembali fitur ekspor PDF dan Excel.

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
import autoTable from 'jspdf-autotable';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

// Definisikan tipe yang lebih spesifik untuk baris data profil
type ProfileRow = {
  registration_number: string | null;
  full_name: string | null;
  school_origin: string | null;
  entry_path: string | null;
  accepted_major: string | null;
  status: string;
  is_reconfirm: boolean | null;
};

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  
  const statuses = [
    { value: 'selesai', label: 'Selesai' },
    { value: 'belum_mengisi', label: 'Belum Mengisi' },
  ];

  // Fungsi untuk mengekspor data ke Excel
  const handleExportExcel = () => {
    const tableData = table.getFilteredRowModel().rows.map(row => {
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
    const doc = new jsPDF();
    doc.text("Rekapan Data Siswa Daftar Ulang", 14, 15);

    const tableData = table.getFilteredRowModel().rows.map(row => {
        const original = row.original as ProfileRow;
        return [
            original.registration_number,
            original.full_name,
            original.accepted_major,
            original.status === 'selesai' ? 'Selesai' : 'Belum',
            original.is_reconfirm === null ? '-' : (original.is_reconfirm ? 'Ya' : 'Tidak'),
        ];
    });

    autoTable(doc, {
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
        
        {/* Filter Status Formulir */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-2">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filter Status
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>Pilih Status Formulir</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statuses.map((status) => (
                    <DropdownMenuCheckboxItem
                        key={status.value}
                        checked={table.getColumn("status")?.getFilterValue() === status.value}
                        onCheckedChange={() => {
                            const currentValue = table.getColumn("status")?.getFilterValue();
                            table.getColumn("status")?.setFilterValue(
                                currentValue === status.value ? undefined : status.value
                            );
                        }}
                    >
                        {status.label}
                    </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => table.getColumn("status")?.setFilterValue(undefined)}>
                    Reset Filter
                </DropdownMenuItem>
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

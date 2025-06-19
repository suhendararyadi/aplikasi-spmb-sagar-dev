// PERHATIAN: Perbarui file ini di `components/student-data-table.tsx`.
// Perubahan: Mengatur default pagination menjadi 10 dan menambahkan kontrol di footer.

"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  HeaderContext
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableToolbar } from "./data-table-toolbar";
import { ArrowUpDown } from "lucide-react";
// Impor komponen Select untuk kontrol pagination
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definisikan tipe untuk data profil
type Profile = {
  id: string;
  full_name: string | null;
  registration_number: string | null;
  school_origin: string | null;
  entry_path: string | null;
  accepted_major: string | null;
  status: string;
  is_reconfirm: boolean | null;
};

// Fungsi helper untuk membuat header kolom yang bisa di-sort
const SortableHeader = <TData, TValue>(
    props: HeaderContext<TData, TValue>,
    title: string
  ) => {
    return (
      <Button
        variant="ghost"
        onClick={() => props.column.toggleSorting(props.column.getIsSorted() === "asc")}
      >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
}

// Definisikan kolom-kolom untuk tabel
export const columns: ColumnDef<Profile>[] = [
  {
    accessorKey: "registration_number",
    header: "No. Pendaftaran",
  },
  {
    accessorKey: "full_name",
    header: (props) => SortableHeader(props, "Nama Lengkap"),
  },
  {
    accessorKey: "school_origin",
    header: "Asal Sekolah",
  },
  {
    accessorKey: "accepted_major",
    header: (props) => SortableHeader(props, "Program Keahlian"),
  },
  {
    accessorKey: "status",
    header: "Status Formulir",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const variant = status === 'selesai' ? 'default' : 'secondary';
      return <Badge variant={variant}>{status === 'selesai' ? 'Selesai' : 'Belum Mengisi'}</Badge>;
    },
  },
  {
    accessorKey: "is_reconfirm",
    header: "Konfirmasi",
    cell: ({ row }) => {
        const isReconfirm = row.getValue("is_reconfirm");
        if (isReconfirm === null || isReconfirm === undefined) {
            return <span className="text-muted-foreground">-</span>;
        }
        return isReconfirm ? <span className="text-green-600 font-semibold">Ya</span> : <span className="text-red-600 font-semibold">Tidak</span>;
    }
  },
];

export function StudentDataTable({ data }: { data: Profile[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    // --- PERUBAHAN DI SINI ---
    // Atur state awal untuk pagination.
    initialState: {
        pagination: {
            pageSize: 10, // Tampilkan 10 baris per halaman secara default
        },
    },
    // --- AKHIR PERUBAHAN ---
  });

  return (
    <div className="rounded-md border bg-card">
      <DataTableToolbar table={table} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* --- FOOTER PAGINATION YANG DIPERBARUI --- */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Baris per halaman</p>
                <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                        table.setPageSize(Number(value))
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Sebelumnya
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Berikutnya
                </Button>
            </div>
        </div>
      </div>
      {/* --- AKHIR FOOTER --- */}
    </div>
  );
}

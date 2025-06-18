// PERHATIAN: Buat file baru ini di `components/student-data-table.tsx`.
// Komponen ini akan menampilkan data dalam bentuk tabel yang interaktif.

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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Definisikan tipe untuk data profil
type Profile = {
  id: string;
  full_name: string | null;
  registration_number: string | null;
  school_origin: string | null;
  accepted_major: string | null;
  status: string;
  is_reconfirm: boolean | null;
};

// Definisikan kolom-kolom untuk tabel
export const columns: ColumnDef<Profile>[] = [
  {
    accessorKey: "registration_number",
    header: "No. Pendaftaran",
  },
  {
    accessorKey: "full_name",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "school_origin",
    header: "Asal Sekolah",
  },
  {
    accessorKey: "accepted_major",
    header: "Program Keahlian",
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
  });

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <Input
          placeholder="Cari berdasarkan nama siswa..."
          value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("full_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

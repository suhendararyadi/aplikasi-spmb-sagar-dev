'use client';

import { Button } from "./ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
    const handlePrint = () => {
        // Fungsi standar browser untuk membuka dialog cetak
        window.print();
    }
    
    return (
        <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Halaman Ini
        </Button>
    );
}

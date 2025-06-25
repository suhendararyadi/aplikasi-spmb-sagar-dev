'use client';

import { QRCodeCanvas } from 'qrcode.react';

// Komponen ini akan menerima sebuah string dan mengubahnya menjadi QR Code.
export function QRCodeDisplay({ value }: { value: string }) {
    // Kita pastikan komponen ini hanya merender di client
    // untuk menghindari error hidrasi saat build.
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="p-2 bg-white inline-block border rounded-md">
            <QRCodeCanvas
                value={value}
                size={128} // Ukuran QR Code dalam piksel
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
            />
        </div>
    );
}

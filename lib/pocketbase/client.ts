'use client';

import PocketBase from 'pocketbase';

/**
 * Membuat instance PocketBase untuk digunakan di Client Components.
 * Aman diimpor dan digunakan di file dengan directive "use client".
 * @returns {PocketBase} Instance PocketBase.
 */
export function createClient() {
    return new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);
}

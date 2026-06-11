"use server";

import { cookies } from "next/headers";

/**
 * Menyimpan pilihan peran aktif Super Admin ke dalam Cookie.
 * Cookielah yang dibaca oleh Layout (Server Component) untuk menyaring menu sidebar yang tampil.
 */
export async function setAdminViewRole(role: "admin" | "pm" | "finance") {
    const cookieStore = await cookies();
    
    // Set cookie hanya berlaku di lingkup panel admin selama 7 hari
    cookieStore.set("admin_view_role", role, {
        path: "/admin",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });
    
    return { success: true };
}

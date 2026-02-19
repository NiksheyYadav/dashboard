"use client";

import { AuthProvider } from "@/lib/auth/auth-context";
import { SidebarProvider } from "@/lib/hooks/useSidebar";
import { ThemeProvider } from "@/lib/theme/theme-context";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SidebarProvider>{children}</SidebarProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    resolvedTheme: "light",
    setTheme: () => { },
});

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    // Restore from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("edupulse_theme") as Theme | null;
        if (stored) {
            setThemeState(stored);
        }
    }, []);

    // Apply theme
    useEffect(() => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        setResolvedTheme(resolved);

        const root = document.documentElement;
        if (resolved === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const resolved = getSystemTheme();
            setResolvedTheme(resolved);
            if (resolved === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        localStorage.setItem("edupulse_theme", t);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

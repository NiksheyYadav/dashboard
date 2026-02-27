"use client";

import { ApiError, getCurrentUser, loginWithPassword, logoutSession, refreshAccessToken } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "admin" | "dean" | "hod" | "coordinator" | "faculty";
export type CoordinatorType = "placement" | "attendance" | "events" | null;

export interface AuthUser {
    name: string;
    email: string;
    role: UserRole;
    coordinatorType: CoordinatorType;
    department: string;
    designation: string;
    avatarInitials: string;
}

interface AuthContextType {
    user: AuthUser | null;
    role: UserRole | null;
    isLoading: boolean;
    login: (email: string, password: string, preferredRole?: UserRole) => Promise<{ ok: boolean; error?: string }>;
    logout: () => void;
}

const AUTH_USER_KEY = "edupulse_auth_user";
const AUTH_TOKEN_KEY = "edupulse_auth_token";

function roleFromEmail(email: string): UserRole {
    const value = email.toLowerCase();
    if (value.includes("admin")) {
        return "admin";
    }
    if (value.includes("dean")) {
        return "dean";
    }
    if (value.includes("hod")) {
        return "hod";
    }
    if (value.includes("coord")) {
        return "coordinator";
    }
    return "faculty";
}

function coordinatorTypeFromEmail(email: string): CoordinatorType {
    const value = email.toLowerCase();
    if (value.includes("placement")) return "placement";
    if (value.includes("attendance") || value.includes("attend")) return "attendance";
    if (value.includes("event")) return "events";
    return null;
}

function initialsFromEmail(email: string): string {
    const local = email.split("@")[0] || "U";
    const cleaned = local.replace(/[^a-zA-Z]/g, " ").trim();
    if (!cleaned) {
        return "US";
    }
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function roleToDesignation(role: UserRole, coordType?: CoordinatorType): string {
    switch (role) {
        case "admin":
            return "System Administrator";
        case "dean":
            return "Dean";
        case "hod":
            return "Head of Department";
        case "coordinator":
            if (coordType === "placement") return "Placement Coordinator";
            if (coordType === "attendance") return "Attendance Coordinator";
            if (coordType === "events") return "Events Coordinator";
            return "Program Coordinator";
        default:
            return "Faculty";
    }
}

function buildAuthUser(email: string, role: UserRole, department?: string | null): AuthUser {
    const coordType = role === "coordinator" ? coordinatorTypeFromEmail(email) : null;
    return {
        name: email.split("@")[0],
        email,
        role,
        coordinatorType: coordType,
        department: department || "N/A",
        designation: roleToDesignation(role, coordType),
        avatarInitials: initialsFromEmail(email),
    };
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    isLoading: true,
    login: async () => ({ ok: false }),
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const clearAuthState = useCallback(() => {
        setUser(null);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem("edupulse_auth");
    }, []);

    const setAuthState = useCallback((authUser: AuthUser, token: string) => {
        setUser(authUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }, []);

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const storedUserRaw = localStorage.getItem(AUTH_USER_KEY) ?? localStorage.getItem("edupulse_auth");
                const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
                if (!storedUserRaw || !storedToken) {
                    return;
                }

                const storedUser = JSON.parse(storedUserRaw) as AuthUser;
                try {
                    const me = await getCurrentUser(storedToken);
                    const syncedUser = buildAuthUser(me.email, storedUser.role ?? roleFromEmail(me.email), me.department);
                    setAuthState(syncedUser, storedToken);
                    return;
                } catch (error) {
                    if (!(error instanceof ApiError) || error.status !== 401) {
                        throw error;
                    }
                }

                const refreshed = await refreshAccessToken();
                const meAfterRefresh = await getCurrentUser(refreshed.access_token);
                const refreshedUser = buildAuthUser(
                    meAfterRefresh.email,
                    storedUser.role ?? roleFromEmail(meAfterRefresh.email),
                    meAfterRefresh.department
                );
                setAuthState(refreshedUser, refreshed.access_token);
            } catch {
                clearAuthState();
            } finally {
                setIsLoading(false);
            }
        };

        void bootstrapAuth();
    }, [clearAuthState, setAuthState]);

    const login = useCallback(
        async (email: string, password: string, _preferredRole?: UserRole) => {
            try {
                const tokenResponse = await loginWithPassword({ email, password });
                const me = await getCurrentUser(tokenResponse.access_token);
                const actualRole = roleFromEmail(me.email);

                const authUser = buildAuthUser(me.email, actualRole, me.department);
                setAuthState(authUser, tokenResponse.access_token);
                router.push("/dashboard");
                return { ok: true };
            } catch (error) {
                if (error instanceof ApiError) {
                    return { ok: false, error: error.message };
                }
                return { ok: false, error: "Unable to sign in. Please try again." };
            }
        },
        [router, setAuthState]
    );

    const logout = useCallback(() => {
        const runLogout = async () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                try {
                    await logoutSession(token);
                } catch {
                    // ignore logout API errors and clear local state anyway
                }
            }
            clearAuthState();
            router.push("/login");
        };

        void runLogout();
    }, [clearAuthState, router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role ?? null,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

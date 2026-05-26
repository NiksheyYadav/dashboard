"use client";

import { ApiError, getCurrentUser, loginWithPassword, logoutSession, refreshAccessToken } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "admin" | "dean" | "hod" | "teacher" | "activity_coordinator";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    roles: string[];
    isMentor: boolean;
    department: string;
    designation: string;
    avatarInitials: string;
}

interface AuthContextType {
    user: AuthUser | null;
    role: UserRole | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string, preferredRole?: UserRole) => Promise<{ ok: boolean; error?: string }>;
    logout: () => void;
}

const AUTH_USER_KEY = "edupulse_auth_user";
const AUTH_TOKEN_KEY = "edupulse_auth_token";

function roleFromEmail(email: string): UserRole {
    const value = email.toLowerCase();
    if (value.includes("admin")) return "admin";
    if (value.includes("dean")) return "dean";
    if (value.includes("hod")) return "hod";
    if (value.includes("coord")) return "activity_coordinator";
    return "teacher";
}

function isMentorFromData(roles: string[] | null | undefined, email: string): boolean {
    if (roles && Array.isArray(roles) && roles.includes("mentor")) return true;
    return email.toLowerCase().includes("mentor");
}

function initialsFromEmail(email: string): string {
    const local = email.split("@")[0] || "U";
    const cleaned = local.replace(/[^a-zA-Z]/g, " ").trim();
    if (!cleaned) return "US";
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function roleToDesignation(role: UserRole, isMentor: boolean): string {
    if (role === "teacher" && isMentor) return "Teacher & Mentor";
    switch (role) {
        case "admin": return "System Administrator";
        case "dean": return "Dean";
        case "hod": return "Head of Department";
        case "activity_coordinator": return "Activity Coordinator";
        case "teacher": return "Faculty";
        default: return "Faculty";
    }
}

function buildAuthUser(
    id: string,
    email: string,
    role: UserRole,
    department?: string | null,
    serverRoles?: string[] | null,
    serverName?: string | null,
): AuthUser {
    const roles = serverRoles && Array.isArray(serverRoles) ? serverRoles : [role];
    const mentor = isMentorFromData(roles, email);
    const name = serverName || email.split("@")[0];
    return {
        id,
        name,
        email,
        role,
        roles,
        isMentor: mentor,
        department: department || "N/A",
        designation: roleToDesignation(role, mentor),
        avatarInitials: initialsFromEmail(email),
    };
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    token: null,
    isLoading: true,
    login: async () => ({ ok: false }),
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const clearAuthState = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem("edupulse_auth");
    }, []);

    const setAuthState = useCallback((authUser: AuthUser, authToken: string) => {
        setUser(authUser);
        setToken(authToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    }, []);

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const storedUserRaw = localStorage.getItem(AUTH_USER_KEY) ?? localStorage.getItem("edupulse_auth");
                const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
                if (!storedUserRaw || !storedToken) return;

                const storedUser = JSON.parse(storedUserRaw) as AuthUser;
                try {
                    const me = await getCurrentUser(storedToken);
                    const meAny = me as unknown as Record<string, unknown>;
                    const serverRole = meAny.primary_role as UserRole | undefined;
                    const serverRoles = meAny.roles as string[] | undefined;
                    const serverName = meAny.name as string | undefined;
                    const syncedUser = buildAuthUser(
                        me.id,
                        me.email,
                        serverRole || storedUser.role || roleFromEmail(me.email),
                        me.department,
                        serverRoles,
                        serverName,
                    );
                    setAuthState(syncedUser, storedToken);
                    return;
                } catch (error) {
                    if (!(error instanceof ApiError) || error.status !== 401) throw error;
                }

                const refreshed = await refreshAccessToken();
                const meAfterRefresh = await getCurrentUser(refreshed.access_token);
                const meAny2 = meAfterRefresh as unknown as Record<string, unknown>;
                const serverRole2 = meAny2.primary_role as UserRole | undefined;
                const serverRoles2 = meAny2.roles as string[] | undefined;
                const serverName2 = meAny2.name as string | undefined;
                const refreshedUser = buildAuthUser(
                    meAfterRefresh.id,
                    meAfterRefresh.email,
                    serverRole2 || storedUser.role || roleFromEmail(meAfterRefresh.email),
                    meAfterRefresh.department,
                    serverRoles2,
                    serverName2,
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
                const meAny3 = me as unknown as Record<string, unknown>;
                const serverRole = meAny3.primary_role as UserRole | undefined;
                const serverRoles = meAny3.roles as string[] | undefined;
                const serverName = meAny3.name as string | undefined;
                const actualRole = serverRole || roleFromEmail(me.email);
                const authUser = buildAuthUser(me.id, me.email, actualRole, me.department, serverRoles, serverName);
                setAuthState(authUser, tokenResponse.access_token);
                router.push("/dashboard");
                return { ok: true };
            } catch (error) {
                if (error instanceof ApiError) return { ok: false, error: error.message };
                return { ok: false, error: "Unable to sign in. Please try again." };
            }
        },
        [router, setAuthState]
    );

    const logout = useCallback(() => {
        const runLogout = async () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                try { await logoutSession(token); } catch { /* ignore */ }
            }
            clearAuthState();
            router.push("/login");
        };
        void runLogout();
    }, [clearAuthState, router]);

    return (
        <AuthContext.Provider value={{ user, role: user?.role ?? null, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "dean" | "hod" | "coordinator" | "faculty";

export interface AuthUser {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    designation: string;
    avatarInitials: string;
}

interface AuthContextType {
    user: AuthUser | null;
    role: UserRole | null;
    isLoading: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
}

const MOCK_USERS: Record<UserRole, AuthUser> = {
    dean: {
        name: "Prof. Rajesh Gupta",
        email: "dean.engineering@sgtuniversity.edu",
        role: "dean",
        department: "Faculty of Engineering",
        designation: "Dean",
        avatarInitials: "RG",
    },
    hod: {
        name: "Dr. Priya Mehta",
        email: "hod.cs@sgtuniversity.edu",
        role: "hod",
        department: "B.Tech CS",
        designation: "Head of Department",
        avatarInitials: "PM",
    },
    coordinator: {
        name: "Dr. Amit Sharma",
        email: "coordinator.cs@sgtuniversity.edu",
        role: "coordinator",
        department: "B.Tech CS",
        designation: "Program Coordinator",
        avatarInitials: "AS",
    },
    faculty: {
        name: "Dr. Robert Chen",
        email: "dr.chen@sgtuniversity.edu",
        role: "faculty",
        department: "B.Tech CS",
        designation: "Assistant Professor",
        avatarInitials: "RC",
    },
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Restore from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("edupulse_auth");
            if (stored) {
                const parsed = JSON.parse(stored) as AuthUser;
                setUser(parsed);
            }
        } catch {
            // ignore
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(
        (role: UserRole) => {
            const mockUser = MOCK_USERS[role];
            setUser(mockUser);
            localStorage.setItem("edupulse_auth", JSON.stringify(mockUser));
            router.push("/dashboard");
        },
        [router]
    );

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("edupulse_auth");
        router.push("/login");
    }, [router]);

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

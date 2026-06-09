import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, saveToken, deleteToken, getUser, saveUser, deleteUser } from '../lib/secure-store';
import { api } from '../lib/api';
import { useRouter, useSegments } from 'expo-router';

type User = {
    id: string;
    email: string;
    full_name: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => {},
    logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const initAuth = async () => {
            try {
                const token = await getToken();
                const cachedUser = await getUser();
                if (token && cachedUser) {
                    setUser(cachedUser);
                } else {
                    await deleteToken();
                    await deleteUser();
                }
            } catch (error) {
                console.error("Failed to restore session", error);
                await deleteToken();
                await deleteUser();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to login
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect to app
            router.replace('/(app)/dashboard');
        }
    }, [user, segments, isLoading]);

    const login = async (token: string, userData: User) => {
        await saveToken(token);
        await saveUser(userData);
        setUser(userData);
    };

    const logout = async () => {
        await deleteToken();
        await deleteUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

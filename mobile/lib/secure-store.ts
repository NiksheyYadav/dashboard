import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'edupulse_auth_token';

export async function saveToken(token: string) {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                localStorage.setItem(TOKEN_KEY, token);
            }
        } else {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
    } catch (e) {
        console.error('Failed to save token', e);
    }
}

export async function getToken() {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                return localStorage.getItem(TOKEN_KEY);
            }
            return null;
        } else {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        }
    } catch (e) {
        console.error('Failed to fetch token', e);
        return null;
    }
}

export async function deleteToken() {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(TOKEN_KEY);
            }
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
    } catch (e) {
        console.error('Failed to delete token', e);
    }
}

const USER_KEY = 'edupulse_user_data';

export async function saveUser(user: any) {
    try {
        const str = JSON.stringify(user);
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, str);
        } else {
            await SecureStore.setItemAsync(USER_KEY, str);
        }
    } catch (e) {
        console.error('Failed to save user', e);
    }
}

export async function getUser() {
    try {
        let str = null;
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') str = localStorage.getItem(USER_KEY);
        } else {
            str = await SecureStore.getItemAsync(USER_KEY);
        }
        return str ? JSON.parse(str) : null;
    } catch (e) {
        return null;
    }
}

export async function deleteUser() {
    try {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
        } else {
            await SecureStore.deleteItemAsync(USER_KEY);
        }
    } catch (e) { }
}

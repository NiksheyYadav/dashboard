import axios from 'axios';
import { getToken, deleteToken, deleteUser } from './secure-store';

import { Platform } from 'react-native';

// Production backend is deployed on Vercel.
// For local dev, set EXPO_PUBLIC_API_URL in .env
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://eblockdashboard.vercel.app';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - token expired or invalid
            await deleteToken();
            await deleteUser();
            // In a real app, you'd trigger a re-render or navigation to Login here.
        }
        return Promise.reject(error);
    }
);

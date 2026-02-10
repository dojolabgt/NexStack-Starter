import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface LoginResponse {
    message: string;
    user: any;
}

export const login = async (email: string, pass: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password: pass });
    return response.data;
};

export const logout = async () => {
    await api.post('/auth/logout');
};

export const checkAuth = async () => {
    // This endpoint doesn't exist yet but acts as a placeholder 
    // for validation or we can just try to refresh if needed.
    // For now, reliance on cookies is enough.
    return true;
}

// Interceptor to handle token refresh automatically
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh on login, refresh, or logout endpoints
        const skipRefreshUrls = ['/auth/login', '/auth/refresh', '/auth/logout'];
        const shouldSkipRefresh = skipRefreshUrls.some(url => originalRequest?.url?.includes(url));

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
            originalRequest._retry = true;

            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login or clear state
                if (typeof window !== 'undefined') {
                    // Clear any stored state and redirect if needed
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

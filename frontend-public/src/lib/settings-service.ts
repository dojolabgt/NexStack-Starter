import { fetchAPI } from './api';

export interface AppSettings {
    id: number;
    appName: string;
    appLogo: string | null;
    appFavicon: string | null;
    primaryColor: string;
    secondaryColor: string;
    allowRegistration: boolean;
    maintenanceMode: boolean;
}

export interface UpdateSettingsDto {
    appName?: string;
    appLogo?: string;
    appFavicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    allowRegistration?: boolean;
    maintenanceMode?: boolean;
}

export async function getSettings(): Promise<AppSettings> {
    return fetchAPI<AppSettings>('/settings', {
        next: { revalidate: 30 }, // Revalidate every 30 seconds
    });
}

/**
 * Update app settings (admin only)
 */
export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return fetchAPI<AppSettings>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
    });
}

/**
 * Upload app logo (admin only)
 */
export const uploadLogo = async (file: File): Promise<AppSettings> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/settings/logo`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Upload app favicon (admin only)
 */
export const uploadFavicon = async (file: File): Promise<AppSettings> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/settings/favicon`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
};

import { useEffect, useState } from 'react';
import { getSettings, type AppSettings } from '@/lib/settings-service';

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsLoading(true);
                const data = await getSettings();
                setSettings(data);
                setError(null);
            } catch (err) {
                console.error('Failed to load settings:', err);
                setError(err instanceof Error ? err : new Error('Failed to load settings'));
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();

        // Poll for settings changes every 30 seconds
        const interval = setInterval(loadSettings, 30000);

        return () => clearInterval(interval);
    }, []);

    return { settings, isLoading, error };
}

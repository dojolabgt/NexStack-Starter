import { useSettings } from '@/hooks/useSettings';

interface AppBrandingProps {
    variant?: 'default' | 'compact' | 'login';
    showName?: boolean;
    className?: string;
}

export function AppBranding({
    variant = 'default',
    showName = true,
    className = ''
}: AppBrandingProps) {
    const { settings, isLoading } = useSettings();

    if (isLoading) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                {showName && <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />}
            </div>
        );
    }

    const logoUrl = settings?.appLogo
        ? (settings.appLogo.startsWith('http') || settings.appLogo.startsWith('data:')
            ? settings.appLogo
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${settings.appLogo}`)
        : null;

    const logoSize = {
        compact: 'h-8 w-8',
        default: 'h-10 w-10',
        login: 'h-16 w-16'
    }[variant];

    const textSize = {
        compact: 'text-base',
        default: 'text-xl',
        login: 'text-2xl'
    }[variant];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {logoUrl && (
                <img
                    src={logoUrl}
                    alt={settings?.appName || 'Logo'}
                    className={`${logoSize} object-contain`}
                />
            )}
            {showName && (
                <span className={`font-bold text-gray-900 ${textSize}`}>
                    {settings?.appName || 'Dashboard'}
                </span>
            )}
        </div>
    );
}

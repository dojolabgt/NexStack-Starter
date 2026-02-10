"use client";

import { usePathname } from "next/navigation";
import { Settings, Bell, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const pageNames: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/users": "Gestión de Usuarios",
    "/dashboard/settings": "Configuración",
};

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const pathname = usePathname();
    const pageName = pageNames[pathname] || "Dashboard";

    return (
        <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">{pageName}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-lg">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="icon" className="rounded-lg">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

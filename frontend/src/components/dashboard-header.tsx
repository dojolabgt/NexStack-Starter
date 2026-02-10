"use client";

import { usePathname } from "next/navigation";
import { Settings, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const pageNames: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/users": "Gestión de Usuarios",
    "/dashboard/settings": "Configuración",
};

export function DashboardHeader() {
    const pathname = usePathname();
    const pageName = pageNames[pathname] || "Dashboard";

    return (
        <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full px-8 flex items-center justify-between">
                <div>
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

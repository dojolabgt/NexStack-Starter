"use client";

import { usePathname, useRouter } from "next/navigation";
import { Settings, Bell, Search, LogOut, ChevronDown, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/image-utils";
import api from "@/lib/auth";

const pageNames: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/users": "Gestión de Usuarios",
    "/dashboard/settings": "Configuración",
    "/dashboard/app-settings": "App Settings",
};

interface DashboardHeaderProps {
    user?: {
        name: string;
        email: string;
        role: string;
        profileImage?: string;
    } | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const pageName = pageNames[pathname] || "Dashboard";

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            router.push("/login");
        }
    };

    return (
        <header className="flex flex-row items-center justify-between gap-2 w-full pb-4 border-b border-gray-100/50">
            {/* Title Section */}
            <div>
                <h2 className="text-lg md:text-2xl font-bold tracking-tight text-zinc-900 truncate max-w-[200px] md:max-w-none">{pageName}</h2>
                <p className="text-sm text-zinc-500 hidden md:block">Bienvenido de nuevo a tu panel.</p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-6">
                {/* Search Bar - Hidden on small mobile */}
                <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all w-64">
                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-gray-700"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 text-gray-500 relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </Button>

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="hidden md:flex rounded-full pl-2 pr-4 py-6 hover:bg-gray-100 items-center gap-3">
                                <Avatar className="h-8 w-8 border border-gray-200">
                                    <AvatarImage src={getImageUrl(user?.profileImage)} alt={user?.name || "User Avatar"} />
                                    <AvatarFallback className="bg-zinc-900 text-white text-xs">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-zinc-900 leading-none">{user?.name}</span>
                                    <span className="text-[10px] text-zinc-500 capitalize leading-none mt-1">{user?.role}</span>
                                </div>
                                <ChevronDown className="h-3 w-3 text-zinc-400 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl shadow-gray-200/50 border-gray-100">
                            <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                                Mi Cuenta
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50 text-gray-700">
                                    <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
                                    <span>Perfil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 focus:bg-gray-50 text-gray-700">
                                    <Settings className="mr-2 h-4 w-4 text-gray-500" />
                                    <span>Configuración</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100 my-1" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-700 mt-1"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

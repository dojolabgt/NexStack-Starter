"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/auth";
import { Home, Users, LogOut, LayoutDashboard, Sparkles, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardHeader } from "@/components/dashboard-header";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    profileImage?: string;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "client", "team"] },
    { name: "Usuarios", href: "/dashboard/users", icon: Users, roles: ["admin"] },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings, roles: ["admin", "client", "team"] },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            router.push("/login");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                        <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="mt-6 text-muted-foreground font-medium">Cargando tu espacio...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const visibleNavigation = navigation.filter((item) =>
        item.roles.includes(user.role)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card/98 backdrop-blur-sm border-r border-border/40 flex flex-col">
                {/* Logo/Brand with gradient */}
                <div className="p-6 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                Pablo Lacán
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="p-4">
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.profileImage || undefined} />
                                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-primary/80 font-bold text-lg text-primary-foreground">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-1">
                    {visibleNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 transition-transform duration-200",
                                    isActive ? "" : "group-hover:scale-105"
                                )} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="p-4 space-y-2 border-t border-border/40">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground group"
                    >
                        <Home className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
                        <span>Volver al Inicio</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-destructive/10 hover:text-destructive w-full text-left group"
                    >
                        <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-72 min-h-screen">
                <DashboardHeader />
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

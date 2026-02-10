"use client";

import { useEffect, useState } from "react";
import api from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Activity, TrendingUp, Clock } from "lucide-react";

interface User {
    email: string;
    name: string;
    role: string;
}

interface Stats {
    totalUsers?: number;
    totalProjects?: number;
    activeProjects?: number;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stats>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await api.get("/auth/me");
                setUser(userResponse.data);

                // Fetch stats only for admin
                if (userResponse.data.role === "admin") {
                    try {
                        const usersResponse = await api.get("/users");
                        setStats({ totalUsers: usersResponse.data.length });
                    } catch (error) {
                        console.error("Failed to fetch stats:", error);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading || !user) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-muted/50 rounded-lg w-1/3"></div>
                    <div className="h-5 bg-muted/50 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                    Hola, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    {user.role === "admin" && "Gestiona tu sistema desde aquí"}
                    {user.role === "client" && "Bienvenido a tu espacio personal"}
                    {user.role === "team" && "Gestiona tu equipo y proyectos"}
                </p>
            </div>

            {/* Stats Cards - Only for Admin */}
            {user.role === "admin" && (
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-border/40 hover:border-border/60 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Usuarios
                            </CardTitle>
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.totalUsers ?? "—"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Usuarios registrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 hover:border-border/60 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Proyectos
                            </CardTitle>
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <FolderKanban className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.totalProjects ?? "—"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                En el sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 hover:border-border/60 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Actividad
                            </CardTitle>
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.activeProjects ?? "—"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Proyectos activos
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Info Cards for Clients/Team */}
            {(user.role === "client" || user.role === "team") && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderKanban className="h-5 w-5" />
                                Mis Proyectos
                            </CardTitle>
                            <CardDescription>
                                Proyectos asignados a tu cuenta
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">
                                    No hay proyectos disponibles
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Actividad Reciente
                            </CardTitle>
                            <CardDescription>
                                Últimas actualizaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">
                                    No hay actividad reciente
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card className="border-border/40">
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                    <CardDescription>
                        Accesos directos a funciones comunes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {user.role === "admin" && (
                            <a
                                href="/dashboard/users"
                                className="group flex items-center gap-4 px-4 py-4 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-all"
                            >
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Gestionar Usuarios</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Ver y administrar usuarios del sistema</p>
                                </div>
                            </a>
                        )}
                        <a
                            href="/"
                            className="group flex items-center gap-4 px-4 py-4 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-all"
                        >
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <Activity className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">Ver Sitio Público</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Ir al sitio web principal</p>
                            </div>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

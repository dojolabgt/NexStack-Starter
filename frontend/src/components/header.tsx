"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { getSettings, type AppSettings } from "@/lib/settings-service";
import { getImageUrl } from "@/lib/image-utils";

export function Header() {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings:", error);
            }
        };
        loadSettings();
    }, []);

    const appName = settings?.appName || "Pablo Lacán";
    const appLogo = settings?.appLogo ? getImageUrl(settings.appLogo) : null;

    return (
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
                    {appLogo && (
                        <img
                            src={appLogo}
                            alt={appName}
                            className="h-8 w-8 rounded object-cover"
                        />
                    )}
                    <span>{appName}</span>
                </Link>

                <nav className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                        <Link href="#services">Servicios</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                        <Link href="#projects">Proyectos</Link>
                    </Button>

                    <Button size="sm" className="rounded-full" asChild>
                        <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" /> Entrar
                        </Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}

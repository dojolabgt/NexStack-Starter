"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { AppBranding } from "@/components/common/AppBranding";

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <AppBranding variant="default" />
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

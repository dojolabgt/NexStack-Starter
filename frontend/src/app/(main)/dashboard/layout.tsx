"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    ChevronRight,
    ChevronLeft,
    ChevronUp,
    X,
    Sparkles
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/image-utils";
import { getSettings, type AppSettings } from "@/lib/settings-service";
import { useAuth } from "@/hooks/useAuth";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    profileImage?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    // Use centralized auth context instead of local state
    const { user, isLoading: loading, logout: handleLogout } = useAuth();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    // Load settings
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

    // Handle Responsiveness
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true); // Default to collapsed/hidden logic on mobile
            } else {
                setIsCollapsed(false); // Default open on desktop
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Define app branding variables
    const appName = settings?.appName || "Pablo Lacán";
    const appLogo = settings?.appLogo ? getImageUrl(settings.appLogo) : null;

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-white"></div>
            </div>
        );
    }

    if (!user) return null;

    const allNavItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Overview", roles: ["admin", "client", "team"] },
        { href: "/dashboard/users", icon: Users, label: "Usuarios", roles: ["admin"] },
        { href: "/dashboard/app-settings", icon: Settings, label: "App Settings", roles: ["admin"] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(user.role));

    const SidebarContent = ({ ignoreCollapse = false }: { ignoreCollapse?: boolean }) => {
        const collapsed = isCollapsed && !ignoreCollapse;

        return (
            <div className="flex flex-col h-full text-white w-full">
                {/* Logo Area - Hidden on mobile drawer */}
                {!ignoreCollapse && (
                    <div className={cn(
                        "flex items-center h-16 mb-6 mt-4 transition-all duration-300 shrink-0",
                        collapsed ? "justify-center px-0" : "px-6"
                    )}>
                        {appLogo ? (
                            <img
                                src={appLogo}
                                alt={appName}
                                className="h-10 w-10 rounded-xl object-cover shrink-0 shadow-lg shadow-white/5"
                            />
                        ) : (
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-white/5">
                                <Sparkles className="h-5 w-5 text-black" fill="currentColor" />
                            </div>
                        )}
                        {!collapsed && (
                            <span className="ml-3 font-bold text-xl tracking-tight">{appName}</span>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <nav className={cn(
                    "flex-1 px-3 py-0 space-y-1 overflow-y-auto scrollbar-hide",
                    ignoreCollapse && "mt-4" // Add top margin when logo is hidden
                )}>
                    {navItems.map((item) => {
                        // Special handling for /dashboard to avoid always being active
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    // Close mobile menu on navigation
                                    if (isMobile) {
                                        setIsMobileMenuOpen(false);
                                    }
                                }}
                                className={cn(
                                    "flex items-center rounded-xl transition-all duration-200 group relative",
                                    collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5",
                                    isActive
                                        ? "bg-white text-zinc-900 shadow-lg shadow-white/10"
                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "shrink-0 transition-colors",
                                        collapsed ? "h-5 w-5" : "h-4 w-4 mr-3",
                                        isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-white"
                                    )}
                                />
                                {!collapsed && (
                                    <span className="font-medium text-[13px] tracking-wide">{item.label}</span>
                                )}

                                {/* Active Indicator for Collapsed Mode */}
                                {collapsed && isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-white rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-3 mt-auto relative">
                    {/* Separator */}
                    <div className={cn(
                        "h-[1px] bg-white/5 mb-4 mx-auto transition-all duration-300",
                        collapsed ? "w-10" : "w-full"
                    )} />

                    <TooltipProvider delayDuration={0}>
                        {/* Collapse Trigger (Desktop Only) - MOVED HERE so it's above the user section but below nav */}
                        {!isMobile && (
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className={cn(
                                    "flex items-center rounded-xl p-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all mb-2",
                                    collapsed ? "justify-center h-10 w-10 mx-auto" : "w-full justify-between px-3"
                                )}
                            >
                                {!collapsed && <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">Colapsar</span>}
                                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </button>
                        )}
                    </TooltipProvider>

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "flex items-center rounded-xl p-2 w-full transition-all duration-200 group outline-none",
                                collapsed ? "justify-center" : "hover:bg-white/5",
                                "data-[state=open]:bg-white/5"
                            )}>
                                <Avatar className="h-9 w-9 border border-white/10 shrink-0">
                                    <AvatarImage src={getImageUrl(user.profileImage)} />
                                    <AvatarFallback className="bg-zinc-800 text-white text-xs">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                {!collapsed && (
                                    <>
                                        <div className="flex flex-col items-start ml-3 min-w-0 text-left flex-1">
                                            <span className="text-sm font-medium text-white truncate w-full">{user.name}</span>
                                            <span className="text-xs text-zinc-500 truncate w-full capitalize">{user.role}</span>
                                        </div>
                                        <ChevronUp className="h-4 w-4 text-zinc-500" />
                                    </>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            side={collapsed ? "right" : "top"}
                            className="w-56 bg-zinc-950 border-white/10 text-zinc-400 p-1 mb-2 ml-2"
                        >
                            <DropdownMenuLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-2 py-1.5">
                                Mi Cuenta
                            </DropdownMenuLabel>

                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="flex items-center cursor-pointer hover:bg-white/10 hover:text-white rounded-lg px-2 py-2 mb-1 focus:bg-white/10 focus:text-white">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configuración</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-white/10" />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="flex items-center cursor-pointer hover:bg-red-500/10 hover:text-red-400 rounded-lg px-2 py-2 mt-1 focus:bg-red-500/10 focus:text-red-400 text-red-400/80"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div >
            </div >
        )
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-sans selection:bg-primary/20 overflow-hidden relative">
            {/* Mobile Header - Fixed at top */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {appLogo ? (
                        <img
                            src={appLogo}
                            alt={appName}
                            className="h-8 w-8 rounded-lg object-cover shadow-lg shadow-white/5"
                        />
                    ) : (
                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/5">
                            <Sparkles className="h-4 w-4 text-black" fill="currentColor" />
                        </div>
                    )}
                    <span className="font-bold text-lg tracking-tight">{appName}</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <Menu className="h-5 w-5 text-white" />
                </button>
            </div>

            {/* Mobile Sidebar (Drawer) */}
            {isMobile && (
                <div className={cn(
                    "fixed inset-0 z-40 bg-zinc-950/90 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className={cn(
                            "fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-white/5 transition-transform duration-300 transform pt-16",
                            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                        onClick={e => e.stopPropagation()}
                    >
                        <SidebarContent ignoreCollapse={true} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out border-r border-white/5 bg-zinc-950",
                isCollapsed ? "w-16" : "w-56"
            )}>
                <SidebarContent />
            </aside>

            {/* Main Content Wrapper */}
            <div className={cn(
                "flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out relative",
                "pt-16 md:pt-0", // Add padding top on mobile for fixed header
                !isMobile && (isCollapsed ? "md:ml-16" : "md:ml-56")
            )}>
                {/* Main Canvas (Scrollable) */}
                <main className="flex-1 p-2 md:p-3 lg:p-4 md:pt-[1.5rem] overflow-hidden">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 h-full border border-zinc-100 relative flex flex-col overflow-hidden">
                        {/* Header Integrated */}
                        <div className="shrink-0 px-6 pt-6 md:px-8 md:pt-8 bg-white z-10">
                            <DashboardHeader user={user} />
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8 lg:p-10 relative bg-slate-50/50">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -z-10 opacity-50 pointer-events-none" />
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/common/Label";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, Upload, Palette, Settings as SettingsIcon, LayoutDashboard, Component } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import {
    getSettings,
    updateSettings,
    uploadLogo,
    uploadFavicon,
    type AppSettings,
} from "@/lib/settings-service";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "branding" | "features";

export default function AppSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [activeTab, setActiveTab] = useState<SettingsTab>("general");

    // Form state
    const [appName, setAppName] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#3B82F6");
    const [secondaryColor, setSecondaryColor] = useState("#10B981");
    const [allowRegistration, setAllowRegistration] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Load settings
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data);
            setAppName(data.appName);
            setPrimaryColor(data.primaryColor);
            setSecondaryColor(data.secondaryColor);
            setAllowRegistration(data.allowRegistration);
            setMaintenanceMode(data.maintenanceMode);
        } catch (_error) {
            toast.error("Error al cargar la configuración");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await updateSettings({
                appName,
                primaryColor,
                secondaryColor,
                allowRegistration,
                maintenanceMode,
            });
            setSettings(updated);
            toast.success("Configuración actualizada correctamente");
        } catch (_error) {
            toast.error("Error al actualizar la configuración");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("El tamaño de la imagen debe ser menor a 5MB");
            return;
        }

        try {
            const updated = await uploadLogo(file);
            setSettings(updated);
            toast.success("Logo subido correctamente");
        } catch (_error) {
            toast.error("Error al subir el logo");
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            toast.error("El tamaño del favicon debe ser menor a 1MB");
            return;
        }

        try {
            const updated = await uploadFavicon(file);
            setSettings(updated);
            toast.success("Favicon subido correctamente");
        } catch (_error) {
            toast.error("Error al subir el favicon");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const menuItems = [
        { id: "general", label: "General", icon: LayoutDashboard },
        { id: "branding", label: "Marca", icon: Palette },
        { id: "features", label: "Funcionalidades", icon: Component },
    ] as const;

    return (
        <div className="flex flex-col gap-6 h-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración de la Aplicación</h1>
                <p className="text-muted-foreground mt-2">
                    Personaliza la apariencia y comportamiento de tu aplicación
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0">
                    <nav className="flex flex-col space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as SettingsTab)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
                                        activeTab === item.id
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 w-full space-y-6">

                    {/* General Settings */}
                    {activeTab === "general" && (
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>General</CardTitle>
                                <CardDescription>Información básica de la aplicación</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="appName">Nombre de la Aplicación</Label>
                                    <Input
                                        id="appName"
                                        value={appName}
                                        onChange={(e) => setAppName(e.target.value)}
                                        placeholder="Mi Dashboard"
                                        maxLength={100}
                                        className="bg-gray-50/50 focus:bg-white transition-all"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Este nombre aparecerá en el título de la pestaña del navegador y en el footer.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Branding Settings */}
                    {activeTab === "branding" && (
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>Marca</CardTitle>
                                <CardDescription>Personaliza los logos y colores</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Logo Upload */}
                                <div className="space-y-3">
                                    <Label>Logo Principal</Label>
                                    <div className="flex items-center gap-6 p-4 border border-border/40 rounded-lg bg-gray-50/30">
                                        <div className="h-20 w-20 rounded-lg border border-border bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0 relative">
                                            {settings?.appLogo ? (
                                                <Image
                                                    src={getImageUrl(settings.appLogo) || ''}
                                                    alt="App Logo"
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <span className="text-2xl font-bold text-muted-foreground/30">
                                                    LOGO
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                    id="logo-upload"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                                    leftIcon={<Upload className="h-4 w-4" />}
                                                >
                                                    Subir Nuevo
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Recomendado: PNG/JPG. Max 5MB. Fondo transparente.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Favicon Upload */}
                                <div className="space-y-3">
                                    <Label>Favicon</Label>
                                    <div className="flex items-center gap-6 p-4 border border-border/40 rounded-lg bg-gray-50/30">
                                        <div className="h-12 w-12 rounded border border-border bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0 relative">
                                            {settings?.appFavicon ? (
                                                <Image
                                                    src={getImageUrl(settings.appFavicon) || ''}
                                                    alt="Favicon"
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <SettingsIcon className="h-6 w-6 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFaviconUpload}
                                                className="hidden"
                                                id="favicon-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('favicon-upload')?.click()}
                                                leftIcon={<Upload className="h-4 w-4" />}
                                                className="h-8 text-xs"
                                            >
                                                Subir Favicon
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                Icono del navegador. 32x32px recomendado.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="primaryColor">Color Primario</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal border-border/60 hover:bg-gray-50"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-full border mr-3 shadow-sm"
                                                        style={{ backgroundColor: primaryColor }}
                                                    />
                                                    <span className="flex-1 font-mono text-xs">{primaryColor}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-3 shadow-xl">
                                                <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="secondaryColor">Color Secundario</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal border-border/60 hover:bg-gray-50"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-full border mr-3 shadow-sm"
                                                        style={{ backgroundColor: secondaryColor }}
                                                    />
                                                    <span className="flex-1 font-mono text-xs">{secondaryColor}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-3 shadow-xl">
                                                <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Features Settings */}
                    {activeTab === "features" && (
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>Funcionalidades</CardTitle>
                                <CardDescription>Control de acceso y características</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Allow Registration */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 border border-border/40">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allowRegistration" className="text-base font-medium">Registro de Usuarios</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Permitir que nuevos usuarios se registren libremente en la plataforma.
                                        </p>
                                    </div>
                                    <Switch
                                        id="allowRegistration"
                                        checked={allowRegistration}
                                        onCheckedChange={setAllowRegistration}
                                    />
                                </div>

                                {/* Maintenance Mode */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 border border-border/40">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="maintenanceMode" className="text-base font-medium">Modo Mantenimiento</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Bloquea el acceso a usuarios no administradores y muestra una página de mantenimiento.
                                        </p>
                                    </div>
                                    <Switch
                                        id="maintenanceMode"
                                        checked={maintenanceMode}
                                        onCheckedChange={setMaintenanceMode}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Save Button (Sticky/Fixed or Bottom) */}
                    <div className="flex justify-end pt-4 border-t border-border/40">
                        <Button onClick={handleSave} disabled={saving} size="lg" className="min-w-[150px]">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Cambios"
                            )}
                        </Button>
                    </div>

                </main>
            </div>
        </div>
    );
}
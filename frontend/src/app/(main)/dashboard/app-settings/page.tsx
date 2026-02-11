"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/common/Label";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, Upload, Palette, Settings as SettingsIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import {
    getSettings,
    updateSettings,
    uploadLogo,
    uploadFavicon,
    type AppSettings,
} from "@/lib/settings-service";
import { getImageUrl } from "@/lib/image-utils";

export default function AppSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);

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
        } catch (error) {
            console.error("Failed to load settings:", error);
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
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast.error("Error al actualizar la configuración");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("El tamaño de la imagen debe ser menor a 5MB");
            return;
        }

        try {
            const updated = await uploadLogo(file);
            setSettings(updated);
            toast.success("Logo subido correctamente");
        } catch (error) {
            console.error("Failed to upload logo:", error);
            toast.error("Error al subir el logo");
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (1MB for favicon)
        if (file.size > 1 * 1024 * 1024) {
            toast.error("El tamaño del favicon debe ser menor a 1MB");
            return;
        }

        try {
            const updated = await uploadFavicon(file);
            setSettings(updated);
            toast.success("Favicon subido correctamente");
        } catch (error) {
            console.error("Failed to upload favicon:", error);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración de la Aplicación</h1>
                <p className="text-muted-foreground mt-2">
                    Personaliza la marca y configuración de tu aplicación
                </p>
            </div>

            {/* Branding Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Marca
                    </CardTitle>
                    <CardDescription>
                        Personaliza el nombre, logo y colores de tu aplicación
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* App Name */}
                    <div className="space-y-2">
                        <Label htmlFor="appName">Nombre de la Aplicación</Label>
                        <Input
                            id="appName"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="Mi Dashboard"
                            maxLength={100}
                        />
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <Label>Logo de la Aplicación</Label>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                                {settings?.appLogo ? (
                                    <img
                                        src={getImageUrl(settings.appLogo) || ''}
                                        alt="App Logo"
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-muted-foreground">
                                        {appName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                    leftIcon={<Upload className="h-4 w-4" />}
                                >
                                    Subir Logo
                                </Button>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Recomendado: Imagen cuadrada, máx 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Favicon Upload */}
                    <div className="space-y-2">
                        <Label>Favicon</Label>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
                                {settings?.appFavicon ? (
                                    <img
                                        src={getImageUrl(settings.appFavicon) || ''}
                                        alt="Favicon"
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-muted-foreground">
                                        {appName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFaviconUpload}
                                    className="hidden"
                                    id="favicon-upload"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => document.getElementById('favicon-upload')?.click()}
                                    leftIcon={<Upload className="h-4 w-4" />}
                                >
                                    Subir Favicon
                                </Button>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Recomendado: 32x32 o 64x64 px, máx 1MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Color Primario</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <div
                                            className="w-6 h-6 rounded border mr-2"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <span className="flex-1">{primaryColor}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-3">
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
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <div
                                            className="w-6 h-6 rounded border mr-2"
                                            style={{ backgroundColor: secondaryColor }}
                                        />
                                        <span className="flex-1">{secondaryColor}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-3">
                                    <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Features Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        Funcionalidades
                    </CardTitle>
                    <CardDescription>
                        Controla las funcionalidades y acceso de la aplicación
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Allow Registration */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="allowRegistration">Permitir Registro de Usuarios (PRÓXIMAMENTE)</Label>
                            <p className="text-sm text-muted-foreground">
                                Habilita o deshabilita el registro de nuevos usuarios
                            </p>
                        </div>
                        <Switch
                            id="allowRegistration"
                            checked={allowRegistration}
                            onCheckedChange={setAllowRegistration}
                        />
                    </div>

                    {/* Maintenance Mode */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="maintenanceMode">Modo Mantenimiento</Label>
                            <p className="text-sm text-muted-foreground">
                                Muestra página de mantenimiento a usuarios no administradores
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

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}

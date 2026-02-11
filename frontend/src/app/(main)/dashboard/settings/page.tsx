"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageCropperDialog } from "@/components/image-cropper-dialog";
import api from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/image-utils";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    profileImage?: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [tempImageForCrop, setTempImageForCrop] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get<User>("/auth/me");
                setUser(response.data);
                setName(response.data.name);
                setEmail(response.data.email);
                setProfileImage(response.data.profileImage || null);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB max)
            const maxSize = 2 * 1024 * 1024; // 2MB in bytes
            if (file.size > maxSize) {
                setErrorMessage("La imagen es demasiado grande. El tamaño máximo es 2MB.");
                setTimeout(() => setErrorMessage(""), 5000);
                e.target.value = ""; // Reset input
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setErrorMessage("Formato de imagen no válido. Usa JPG, PNG, GIF o WebP.");
                setTimeout(() => setErrorMessage(""), 5000);
                e.target.value = ""; // Reset input
                return;
            }

            // Read file and open cropper
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageForCrop(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.onerror = () => {
                setErrorMessage("Error al leer la imagen. Intenta de nuevo.");
                setTimeout(() => setErrorMessage(""), 5000);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImage: string) => {
        // Convert base64 to File object
        const base64ToFile = async (base64String: string, filename: string): Promise<File> => {
            const response = await fetch(base64String);
            const blob = await response.blob();
            return new File([blob], filename, { type: blob.type });
        };

        try {
            // Convert base64 to File
            const file = await base64ToFile(croppedImage, 'profile-image.jpg');

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload to new endpoint
            const response = await api.post<User>('/users/profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local state with server response
            setUser(response.data);
            setProfileImage(response.data.profileImage || null);

            setSuccessMessage('Foto de perfil actualizada correctamente');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            console.error('Failed to update profile image:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;

            let errorMsg = 'Error al actualizar la foto de perfil.';
            if (err.response?.status === 413) {
                errorMsg = 'La imagen es demasiado grande. Intenta con una más pequeña.';
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }

            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(''), 7000);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            // Only send name for non-admins, name and email for admins
            const updateData: Partial<User> = { name };
            if (user?.role === "admin") {
                updateData.email = email;
            }

            // Note: Profile image is now handled separately via /users/profile-image endpoint
            await api.patch("/users/profile", updateData);

            // Refresh user data
            const response = await api.get<User>("/auth/me");
            setUser(response.data);
            setName(response.data.name);
            setEmail(response.data.email);
            setProfileImage(response.data.profileImage || null);

            setSuccessMessage("Perfil actualizado correctamente");
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.error("Failed to update profile:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;

            // Handle specific error messages
            let errorMsg = "Error al actualizar el perfil. Intenta de nuevo.";

            if (err.response?.status === 400) {
                errorMsg = err.response?.data?.message || "Datos inválidos. Verifica la información.";
            } else if (err.response?.status === 401) {
                errorMsg = "Sesión expirada. Por favor, inicia sesión de nuevo.";
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }

            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 7000);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-muted/50 rounded-lg w-1/3"></div>
                    <div className="h-64 bg-muted/50 rounded-lg"></div>
                </div>
            </div>
        );
    }

    const isAdmin = user.role === "admin";

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground text-lg">
                    Gestiona tu perfil y preferencias
                </p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            {errorMessage && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <Card className="border-border/40">
                <CardHeader>
                    <CardTitle>Información del Perfil</CardTitle>
                    <CardDescription>
                        Actualiza tu foto de perfil y datos personales
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={getImageUrl(profileImage)} />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Label htmlFor="picture" className="cursor-pointer">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-all">
                                    <Camera className="h-4 w-4" />
                                    <span className="text-sm font-medium">Cambiar foto</span>
                                </div>
                                <Input
                                    id="picture"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG, GIF o WebP. Máximo 5MB.
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre completo"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            disabled={!isAdmin}
                        />
                        {!isAdmin && (
                            <p className="text-xs text-muted-foreground">
                                Solo los administradores pueden cambiar el email
                            </p>
                        )}
                    </div>

                    {/* Role (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Input
                            id="role"
                            value={user.role}
                            disabled
                            className="capitalize"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border-border/40">
                <CardHeader>
                    <CardTitle>Información de la Cuenta</CardTitle>
                    <CardDescription>
                        Detalles de tu cuenta
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border/40">
                        <div>
                            <p className="text-sm font-medium">ID de Usuario</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{user.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-medium">Tipo de Cuenta</p>
                            <p className="text-sm text-muted-foreground mt-0.5 capitalize">{user.role}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Image Cropper Dialog */}
            {tempImageForCrop && (
                <ImageCropperDialog
                    open={isCropperOpen}
                    onOpenChange={setIsCropperOpen}
                    imageSrc={tempImageForCrop}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}

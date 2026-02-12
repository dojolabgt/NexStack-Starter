"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Loader2, Lock, User as UserIcon } from "lucide-react";
import { ImageCropperDialog } from "@/components/image-cropper-dialog";
import api from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/image-utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    profileImage?: string;
}

// Schema for Profile Info
const profileSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
});

// Schema for Password Change
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, "Debe contener mayúscula, minúscula y número/símbolo"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Image Upload State
    const [tempImageForCrop, setTempImageForCrop] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    // Forms
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get<User>("/auth/me");
                setUser(response.data);
                profileForm.reset({
                    name: response.data.name,
                    email: response.data.email,
                });
            } catch (error) {
                console.error("Failed to fetch user:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router, profileForm]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("La imagen es demasiado grande. Máximo 2MB.");
                e.target.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageForCrop(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImage: string) => {
        try {
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            const file = new File([blob], 'profile-image.jpg', { type: blob.type });

            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post<User>('/users/profile-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUser(res.data);
            toast.success("Foto de perfil actualizada");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la foto");
        }
    };

    const onProfileSubmit = async (data: ProfileFormValues) => {
        try {
            // Only send name for non-admins to avoid 403/400 if backend restricts email
            const updateData: Partial<User> = { name: data.name };
            if (user?.role === "admin") {
                updateData.email = data.email;
            }

            await api.patch("/users/profile", updateData);

            // Refresh local user data
            const res = await api.get<User>("/auth/me");
            setUser(res.data);
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el perfil");
        }
    };

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            await api.patch("/users/change-password", {
                currentPassword: data.currentPassword,
                password: data.newPassword,
            });
            toast.success("Contraseña actualizada correctamente");
            passwordForm.reset();
        } catch (error) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (err.response?.data?.message === "Invalid current password") {
                passwordForm.setError("currentPassword", {
                    type: "manual",
                    message: "La contraseña actual es incorrecta"
                });
            } else {
                toast.error(err.response?.data?.message || "Error al cambiar la contraseña");
            }
        }
    };

    if (loading || !user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isAdmin = user.role === "admin";

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración de Cuenta</h1>
                <p className="text-muted-foreground">
                    Gestiona tu información personal y seguridad.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>Actualiza tus datos básicos</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Photo Upload Section */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-border/50">
                                    <div className="relative group">
                                        <Avatar className="h-28 w-28 border-4 border-white shadow-md">
                                            <AvatarImage src={getImageUrl(user.profileImage)} className="object-cover" />
                                            <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Label
                                            htmlFor="picture"
                                            className="absolute bottom-0 right-0 p-2 bg-zinc-900 text-white rounded-full cursor-pointer hover:bg-zinc-800 transition-all shadow-lg border-2 border-white"
                                        >
                                            <Camera className="h-4 w-4" />
                                            <Input
                                                id="picture"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </Label>
                                    </div>
                                    <div className="text-center sm:text-left space-y-1 pt-2">
                                        <h3 className="font-medium text-gray-900">Foto de Perfil</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Sube una imagen para personalizar tu perfil.
                                            <br className="hidden sm:block" />
                                            Formatos permitidos: JPG, PNG, GIF.
                                        </p>
                                    </div>
                                </div>

                                {/* Personal Info Form */}
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre Completo</Label>
                                            <Input
                                                id="name"
                                                {...profileForm.register("name")}
                                                className="bg-gray-50/50 focus:bg-white transition-all"
                                                placeholder="Tu nombre"
                                            />
                                            {profileForm.formState.errors.name && (
                                                <p className="text-xs text-red-500 font-medium">{profileForm.formState.errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Correo Electrónico</Label>
                                            <Input
                                                id="email"
                                                {...profileForm.register("email")}
                                                disabled={!isAdmin}
                                                className="bg-gray-50/50 focus:bg-white transition-all disabled:opacity-70"
                                            />
                                            {profileForm.formState.errors.email && (
                                                <p className="text-xs text-red-500 font-medium">{profileForm.formState.errors.email.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty}
                                            className="min-w-[140px]"
                                        >
                                            {profileForm.formState.isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Security Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-border/60 shadow-sm h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Lock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle>Seguridad</CardTitle>
                                    <CardDescription>Actualiza tu contraseña</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        {...passwordForm.register("currentPassword")}
                                        className="bg-gray-50/50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                    {passwordForm.formState.errors.currentPassword && (
                                        <p className="text-xs text-red-500 font-medium">{passwordForm.formState.errors.currentPassword.message}</p>
                                    )}
                                </div>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...passwordForm.register("newPassword")}
                                        className="bg-gray-50/50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                    {passwordForm.formState.errors.newPassword && (
                                        <p className="text-xs text-red-500 font-medium">{passwordForm.formState.errors.newPassword.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...passwordForm.register("confirmPassword")}
                                        className="bg-gray-50/50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-xs text-red-500 font-medium">{passwordForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full mt-2"
                                    disabled={passwordForm.formState.isSubmitting}
                                >
                                    {passwordForm.formState.isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Actualizar Contraseña"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Account Metadata Card */}
            <Card className="border-border/60 shadow-sm bg-gray-50/50">
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground gap-2">
                        <div className="flex gap-2">
                            <span className="font-medium">ID de Usuario:</span>
                            <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">{user.id}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-medium">Rol:</span>
                            <span className="capitalize px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">{user.role}</span>
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

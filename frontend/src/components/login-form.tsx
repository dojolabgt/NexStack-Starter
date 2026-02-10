
"use client";

import { login } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
    email: z.string().email("Email inválido").min(1, "El email es requerido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSuccess?: () => void;
    role?: "client" | "team";
}

export function LoginForm({ onSuccess, role = "client" }: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchema) => {
        setIsLoading(true);
        try {
            const response = await login(data.email, data.password);
            const userRole = response.user.role;

            // Validate Role vs Tab
            if (role === 'client' && userRole !== 'client') {
                throw new Error("No tienes permisos para acceder al portal de Clientes.");
            }
            if (role === 'team' && userRole === 'client') {
                throw new Error("No tienes permisos para acceder al portal del Equipo.");
            }

            toast.success(`Bienvenido al portal de ${role === 'client' ? 'Clientes' : 'Equipo'}`);

            // Wait a bit for cookies to be set before redirecting
            await new Promise(resolve => setTimeout(resolve, 500));

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Login failed:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            let message = "Ocurrió un problema al iniciar sesión.";

            // Priority 1: Specific errors thrown manually (e.g. Role Validation)
            if (err.message && !err.response) {
                message = err.message;
            }
            // Priority 2: Backend response messages
            else if (err.response?.data?.message) {
                message = err.response.data.message;
                if (message === "Unauthorized") message = "Email o contraseña incorrectos.";
            }
            // Priority 3: Network/Status errors
            else if (err.message) {
                if (err.response?.status === 401) message = "Email o contraseña incorrectos.";
            }

            // Override strict "Unauthorized" or generic "Invalid credentials"
            if (message === "Credenciales inválidas" || message.includes("Unauthorized")) {
                message = "Email o contraseña incorrectos.";
            }

            toast.error(message, {
                description: message.includes("permisos") ? undefined : "Por favor verifique sus datos e intente nuevamente.",
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="admin@admin.com"
                    {...register("email")}
                    disabled={isLoading}
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    {...register("password")}
                    disabled={isLoading}
                />
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">Recordarme</Label>
                </div>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                </a>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Entrando..." : "Entrar"}
            </Button>
        </form >
    );
}

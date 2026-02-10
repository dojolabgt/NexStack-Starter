"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CreateUserDto, User, createUser, updateUser } from "@/lib/users-service";
import { toast } from "sonner";

const userSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().optional(),
    role: z.enum(["admin", "client", "team"]),
}).refine((data) => {
    // If it's a new user (no ID logic inside here, but we can check if password is empty), password is required
    // Actually, passing `isEditing` to the schema is harder. Let's do validation in component or assume optional is fine and check manually.
    return true;
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userToEdit?: User | null;
    onSuccess: () => void;
}

export function UserDialog({ open, onOpenChange, userToEdit, onSuccess }: UserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!userToEdit;

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            role: "client",
        },
    });

    // Reset form when dialog opens/closes or userToEdit changes
    useEffect(() => {
        if (open) {
            if (userToEdit) {
                setValue("name", userToEdit.name);
                setValue("email", userToEdit.email);
                setValue("role", userToEdit.role);
                setValue("password", ""); // Reset password field
            } else {
                reset({
                    name: "",
                    email: "",
                    password: "",
                    role: "client",
                });
            }
        }
    }, [open, userToEdit, setValue, reset]);

    const onSubmit = async (data: UserFormValues) => {
        if (!isEditing && !data.password) {
            // Manual validation for required password on create
            toast.error("La contraseña es requerida para nuevos usuarios");
            return;
        }

        setIsLoading(true);
        try {
            if (isEditing && userToEdit) {
                await updateUser(userToEdit.id, data as any);
                toast.success("Usuario actualizado correctamente");
            } else {
                await createUser(data as CreateUserDto);
                toast.success("Usuario creado correctamente");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Ocurrió un error al guardar el usuario");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-3xl border-0 shadow-2xl shadow-zinc-900/20 bg-white p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                    <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
                        {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {isEditing ? "Actualiza la información del usuario en el sistema." : "Completa el formulario para registrar un nuevo usuario."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nombre Completo</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Ej. Juan Pérez"
                            className="h-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 transition-all font-medium text-zinc-800"
                        />
                        {errors.name && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="ejemplo@correo.com"
                            disabled={isEditing}
                            className="h-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 transition-all font-medium text-zinc-800 disabled:opacity-50 disabled:bg-gray-100"
                        />
                        {errors.email && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Rol</Label>
                            <Select
                                onValueChange={(val) => setValue("role", val as any)}
                                defaultValue={userToEdit?.role || "client"}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 transition-all font-medium text-zinc-800">
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="team">Equipo</SelectItem>
                                    <SelectItem value="client">Cliente</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.role.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Contraseña {isEditing && <span className="text-zinc-400 font-normal normal-case">(Opcional)</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                placeholder="••••••••"
                                className="h-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 transition-all font-medium text-zinc-800"
                            />
                            {errors.password && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.password.message}</p>}
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="rounded-xl h-11 text-zinc-500 hover:text-zinc-900 hover:bg-gray-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-xl h-11 bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 px-8"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

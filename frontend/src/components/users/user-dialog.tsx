"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Label } from "@/components/common/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/Select";
import { CreateUserDto, UpdateUserDto, User, createUser, updateUser } from "@/lib/users-service";
import { toast } from "sonner";

import { UserRole } from "@/lib/types/enums";

const userSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().optional(),
    role: z.nativeEnum(UserRole),
}).refine(() => {
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
            role: UserRole.USER,
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
                    role: UserRole.USER,
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
                await updateUser(userToEdit.id, data as UpdateUserDto);
                toast.success("Usuario actualizado correctamente");
            } else {
                await createUser(data as CreateUserDto);
                toast.success("Usuario creado correctamente");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            // Safe casting for error response
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Ocurrió un error al guardar el usuario");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Actualiza la información del usuario en el sistema." : "Completa el formulario para registrar un nuevo usuario."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Ej. Juan Pérez"
                        />
                        {errors.name && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="ejemplo@correo.com"
                            disabled={isEditing}
                        />
                        {errors.email && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select
                                onValueChange={(val) => setValue("role", val as UserRole)}
                                defaultValue={userToEdit?.role || UserRole.USER}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                                    <SelectItem value={UserRole.TEAM}>Equipo</SelectItem>
                                    <SelectItem value={UserRole.USER}>Usuario</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.role.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Contraseña {isEditing && <span className="text-zinc-400 font-normal normal-case">(Opcional)</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-xs font-medium text-red-500 animate-pulse">{errors.password.message}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="h-11 text-zinc-500 hover:text-zinc-900 hover:bg-gray-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                            className="h-11 bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 px-8"
                        >
                            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

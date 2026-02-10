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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modifica los datos del usuario aquí." : "Ingresa los datos para crear un nuevo usuario."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" {...register("name")} placeholder="Juan Perez" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} placeholder="juan@ejemplo.com" disabled={isEditing} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                            onValueChange={(val) => setValue("role", val as any)}
                            defaultValue={userToEdit?.role || "client"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="team">Equipo</SelectItem>
                                <SelectItem value="client">Cliente</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña {isEditing && "(Opcional)"}</Label>
                        <Input id="password" type="password" {...register("password")} placeholder="••••••" />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

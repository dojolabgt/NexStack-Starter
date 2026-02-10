"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, deleteUser } from "@/lib/users-service";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userToDelete: User | null;
    onSuccess: () => void;
}

export function DeleteUserDialog({ open, onOpenChange, userToDelete, onSuccess }: DeleteUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!userToDelete) return;

        setIsLoading(true);
        try {
            await deleteUser(userToDelete.id);
            toast.success("Usuario eliminado correctamente");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error("Ocurrió un error al eliminar el usuario");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                        <span className="font-bold"> {userToDelete?.name} </span>
                        y removerá sus datos de nuestros servidores.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

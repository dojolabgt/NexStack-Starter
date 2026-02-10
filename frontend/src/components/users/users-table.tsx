"use client";

import { useEffect, useState } from "react";
import { User, getUsers } from "@/lib/users-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserDialog } from "./user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20">Admin</Badge>;
            case 'team':
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20">Equipo</Badge>;
            case 'client':
                return <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">Cliente</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        className="pl-10 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddOpen(true)} size="lg" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </div>

            <Card className="border-border/40">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/40">
                            <TableHead className="font-semibold pl-6">Nombre</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Rol</TableHead>
                            <TableHead className="font-semibold">Fecha de Registro</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary"></div>
                                        <span className="text-muted-foreground">Cargando usuarios...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 text-muted-foreground/50" />
                                        <p className="text-muted-foreground">No se encontraron usuarios</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <ContextMenu key={user.id}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow className="border-border/40 hover:bg-muted/30 cursor-pointer">
                                            <TableCell className="font-medium pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={user.profileImage || undefined} />
                                                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/80 font-semibold text-sm text-primary-foreground">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(user.createdAt), "PPP", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setEditingUser(user)} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingUser(user)}
                                                            className="text-destructive focus:text-destructive cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-48">
                                        <ContextMenuItem onClick={() => setEditingUser(user)} className="cursor-pointer">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Editar Usuario
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            onClick={() => setDeletingUser(user)}
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar Usuario
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <UserDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onSuccess={fetchUsers}
            />

            <UserDialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                userToEdit={editingUser}
                onSuccess={fetchUsers}
            />

            <DeleteUserDialog
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                userToDelete={deletingUser}
                onSuccess={fetchUsers}
            />
        </div>
    );
}

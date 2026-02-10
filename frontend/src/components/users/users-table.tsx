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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; // Fixed number of items per page

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

    // Filter Logic
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const getRoleBadge = (role: string) => {
        const styles = {
            admin: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20",
            team: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
            client: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
        };

        const roleName = {
            admin: "Administrador",
            team: "Equipo",
            client: "Cliente"
        };

        const key = role as keyof typeof styles;
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${styles[key] || "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10"}`}>
                {roleName[key] || role}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header / Search Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-1 rounded-2xl">
                <div className="relative w-full sm:w-72 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <Input
                        placeholder="Buscar usuarios..."
                        className="pl-10 h-10 bg-gray-50/50 border-gray-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Top Simple Pagination */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 mr-2 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            <span className="sr-only">Anterior</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Button>
                        <span className="text-xs font-medium px-2 text-gray-500 min-w-[3rem] text-center">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || isLoading || totalPages === 0}
                        >
                            <span className="sr-only">Siguiente</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>

                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-10 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 px-4 w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                </div>
            </div>

            {/* Main Table Card */}
            <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-gray-100 bg-gray-50/30">
                            <TableHead className="font-semibold pl-6 h-12 text-xs uppercase tracking-wider text-gray-500">Usuario</TableHead>
                            <TableHead className="font-semibold h-12 text-xs uppercase tracking-wider text-gray-500">Email</TableHead>
                            <TableHead className="font-semibold h-12 text-xs uppercase tracking-wider text-gray-500">Rol</TableHead>
                            <TableHead className="font-semibold h-12 text-xs uppercase tracking-wider text-gray-500">Fecha</TableHead>
                            <TableHead className="w-[50px] h-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        <span className="text-sm text-gray-400 animate-pulse">Cargando datos...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                                            <Search className="h-5 w-5 text-gray-300" />
                                        </div>
                                        <p className="font-medium text-gray-900">No se encontraron usuarios</p>
                                        <p className="text-sm text-gray-400">Intenta ajustar tu búsqueda</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map((user) => (
                                <ContextMenu key={user.id}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                            <TableCell className="font-medium pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-gray-100 shadow-sm transition-transform group-hover:scale-105">
                                                        <AvatarImage src={user.profileImage || undefined} />
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-white text-indigo-600 font-medium text-xs">
                                                            {user.name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {format(new Date(user.createdAt), "dd MMM, yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl shadow-gray-200/50 border-gray-100">
                                                        <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setEditingUser(user)} className="cursor-pointer gap-2 text-gray-600 focus:text-indigo-600 focus:bg-indigo-50 rounded-lg mx-1">
                                                            <Pencil className="h-3.5 w-3.5" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingUser(user)}
                                                            className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg mx-1 my-1"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-48 rounded-xl shadow-xl shadow-gray-200/50 border-gray-100 bg-white">
                                        <ContextMenuItem onClick={() => setEditingUser(user)} className="cursor-pointer gap-2 text-gray-600 focus:text-indigo-600 focus:bg-indigo-50 rounded-lg mx-1 my-1">
                                            <Pencil className="h-3.5 w-3.5" />
                                            Editar Usuario
                                        </ContextMenuItem>
                                        <ContextMenuSeparator className="bg-gray-100" />
                                        <ContextMenuItem
                                            onClick={() => setDeletingUser(user)}
                                            className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg mx-1 my-1"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Eliminar Usuario
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Robust Bottom Pagination */}
                {!isLoading && filteredUsers.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                        <p className="text-xs text-gray-500">
                            Mostrando <span className="font-medium text-gray-900">{Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}</span> a <span className="font-medium text-gray-900">{Math.min(filteredUsers.length, currentPage * itemsPerPage)}</span> de <span className="font-medium text-gray-900">{filteredUsers.length}</span> resultados
                        </p>

                        <div className="flex items-center gap-1">
                            {/* Numbered Pages */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-8 w-8 p-0 rounded-lg text-xs font-medium transition-all ${currentPage === page
                                        ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10 hover:bg-zinc-800"
                                        : "text-gray-500 hover:bg-white hover:text-gray-900"
                                        }`}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
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

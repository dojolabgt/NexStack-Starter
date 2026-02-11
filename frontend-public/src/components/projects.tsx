
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Lock, Unlock, Eye } from "lucide-react";
import Link from "next/link";
import { getProjects } from "@/lib/api";


export function Projects() {
    const projects = getProjects();
    const [unlockedProjects, setUnlockedProjects] = useState<Set<number>>(new Set());
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Simple hardcoded password
    const CORRECT_PASSWORD = "admin";

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            if (selectedProjectIndex !== null) {
                setUnlockedProjects(prev => new Set(prev).add(selectedProjectIndex));
            }
            setError(false);
            setIsDialogOpen(false);
            setPassword("");
        } else {
            setError(true);
        }
    };

    const openUnlockDialog = (index: number) => {
        setSelectedProjectIndex(index);
        setIsDialogOpen(true);
        setError(false);
        setPassword("");
    };

    return (
        <section id="projects" className="container mx-auto py-20 space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Proyectos Seleccionados</h2>
                <p className="text-muted-foreground max-w-[600px] mx-auto">
                    Una colección de trabajos que definen mi experiencia. Desliza para ver más.
                </p>
            </div>

            <div className="mx-auto px-12 relative">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {projects.map((project, index) => {
                            const isLocked = project.locked && !unlockedProjects.has(index);

                            return (
                                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3 h-full">
                                    <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm flex flex-col h-full">
                                        <div className="aspect-video relative bg-muted flex items-center justify-center text-muted-foreground">
                                            {/* Replace with actual images */}
                                            {isLocked ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Lock className="h-8 w-8 opacity-50" />
                                                    <span className="text-xs font-medium uppercase tracking-wider">Privado</span>
                                                </div>
                                            ) : (
                                                <span>Imagen del Proyecto</span>
                                            )}
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-start gap-2">
                                                {project.title}
                                                {project.locked && (
                                                    isLocked ? <Lock className="h-4 w-4 text-muted-foreground shrink-0" /> : <Unlock className="h-4 w-4 text-primary shrink-0" />
                                                )}
                                            </CardTitle>
                                            <div className="flex gap-2 flex-wrap min-h-[1.5rem]">
                                                {!isLocked && project.tags.map(tag => (
                                                    <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{tag}</span>
                                                ))}
                                                {isLocked && <span className="text-xs text-muted-foreground italic">Etiquetas ocultas</span>}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <CardDescription>
                                                {isLocked ? "Este proyecto está protegido. Introduce la contraseña para ver los detalles." : project.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter className="mt-auto">
                                            {isLocked ? (
                                                <Button onClick={() => openUnlockDialog(index)} variant="secondary" className="w-full">
                                                    <Lock className="mr-2 h-4 w-4" /> Desbloquear
                                                </Button>
                                            ) : (
                                                <Button asChild variant="default" className="w-full">
                                                    <Link href={project.link}>
                                                        Ver Proyecto <Eye className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Acceso Restringido</DialogTitle>
                        <DialogDescription>
                            Introduce la contraseña para ver los detalles de este proyecto.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={error ? "border-destructive" : ""}
                                autoFocus
                            />
                            {error && <p className="text-sm text-destructive">Contraseña incorrecta</p>}
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full">Desbloquear</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}

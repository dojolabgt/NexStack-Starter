
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code2, Globe, LayoutTemplate } from "lucide-react";
import { getServices } from "@/lib/api";

const iconMap = {
    Globe: Globe,
    LayoutTemplate: LayoutTemplate,
    Code2: Code2,
};

export function Services() {
    const services = getServices();

    return (
        <section id="services" className="container mx-auto py-20 space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Servicios</h2>
                <p className="text-muted-foreground max-w-[600px] mx-auto">
                    Ofrezco una gama de servicios para ayudarte a dar vida a tus ideas digitales.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((service, index) => {
                    const Icon = iconMap[service.iconName];
                    return (
                        <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>{service.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    {service.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}

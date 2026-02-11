
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHeroData } from "@/lib/api";

export function Hero() {
    const data = getHeroData();

    return (
        <section className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] py-20 text-center space-y-8 animate-fade-in-up">
            <div className="space-y-4 max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-2">
                    {data.title.split(" ").slice(0, 2).join(" ")} <br /> {data.title.split(" ").slice(2).join(" ")}
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] mx-auto font-light">
                    {data.subtitle}
                </p>
            </div>
            <div className="flex gap-4">
                <Button asChild size="lg" className="rounded-full">
                    <Link href="#projects">
                        {data.ctaPrimary} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                    <Link href="#services">
                        {data.ctaSecondary}
                    </Link>
                </Button>
            </div>
        </section>
    );
}

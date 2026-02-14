import { Hero } from "@/components/hero";
import Link from "next/link";
import { Technologies } from "@/components/common/Technologies";
import { Features } from "@/components/features";
import { DashboardPreview } from "@/components/dashboard-preview";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Header />
            <main className="flex-1">
                <Hero />
                <Technologies />
                <Features />
                <DashboardPreview />
            </main>
            <Footer />
        </div>
    );
}

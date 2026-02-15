"use client";

import { useEffect, useState } from "react";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={`gradient-bg transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {children}
        </div>
    );
}

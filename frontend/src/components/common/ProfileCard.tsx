'use client';

import React from 'react';
import { Fingerprint, Lock, Activity } from 'lucide-react';

interface ReflectiveCardProps {
    imageUrl?: string;
    name?: string;
    title?: string;
    idNumber?: string;
    className?: string;
    style?: React.CSSProperties;
}

const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
    imageUrl = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400',
    name = 'ALEXANDER DOE',
    title = 'SENIOR DEVELOPER',
    idNumber = '8901-2345-6789',
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`relative w-[320px] h-[500px] rounded-[20px] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-sans ${className}`}
            style={style}
        >
            {/* Imagen de fondo simple */}
            <img
                src={imageUrl}
                alt="Profile"
                className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
            />

            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            {/* Contenido */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] px-2 py-1 bg-white/10 rounded border border-white/20 backdrop-blur-sm">
                        <Lock size={14} className="opacity-80" />
                        <span>Medialab</span>
                    </div>
                    <Activity className="opacity-80" size={20} />
                </div>

                {/* Nombre y título */}
                <div className="flex-1 flex flex-col justify-end items-center text-center gap-6 mb-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold tracking-[0.05em] m-0 mb-2 drop-shadow-lg">{name}</h2>
                        <p className="text-xs tracking-[0.2em] opacity-70 m-0 uppercase">{title}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end border-t border-white/20 pt-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] tracking-[0.1em] opacity-60">ID NUMBER</span>
                        <span className="font-mono text-sm tracking-[0.05em]">{idNumber}</span>
                    </div>
                    <div className="opacity-40">
                        <Fingerprint size={32} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReflectiveCard;
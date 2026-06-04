import React from "react";
import { cn } from "@/lib/utils";

/**
 * 1. EduPulse Nexus Loader
 * A highly futuristic 3D orbiting ring animation, representing the
 * interconnected nature of Teachers, Students, and Administrators.
 */
export function EduPulseNexusLoader({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    const sizeMap = {
        sm: "w-8 h-8",
        md: "w-16 h-16",
        lg: "w-24 h-24"
    };

    return (
        <div className={cn(`relative flex items-center justify-center perspective-1000`, sizeMap[size], className)}>
            {/* Core energy source */}
            <div className="absolute w-[25%] h-[25%] bg-[#1a6fdb] rounded-full animate-pulse-glow shadow-[0_0_20px_#1a6fdb]" />
            
            {/* Ring 1 - Outer Blue */}
            <div className="absolute w-full h-full rounded-full border-2 border-[#1a6fdb]/20 border-t-[#1a6fdb] animate-spin-3d-x" />
            
            {/* Ring 2 - Outer Gold */}
            <div className="absolute w-[85%] h-[85%] rounded-full border-2 border-[#d4a843]/20 border-r-[#d4a843] animate-spin-3d-y" />
            
            {/* Ring 3 - Inner Green */}
            <div className="absolute w-[70%] h-[70%] rounded-full border-2 border-[#059669]/20 border-b-[#059669] animate-spin-3d-z" />
        </div>
    );
}

/**
 * 2. Data Waveform Loader
 * A sleek, sound-wave-like loading bar that morphs colors,
 * perfect for small inline loading states.
 */
export function DataWaveformLoader({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-end justify-center gap-1 h-6", className)}>
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="w-1.5 rounded-t-sm animate-waveform"
                    style={{ animationDelay: `${i * 120}ms` }}
                />
            ))}
        </div>
    );
}

/**
 * 3. Quantum Hexagon Loader
 * A geometric, pulsating hexagon grid. Very premium and modern.
 */
export function QuantumHexagonLoader({ className }: { className?: string }) {
    return (
        <div className={cn("flex gap-2 items-center justify-center", className)}>
            {[...Array(3)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-4 h-4 rounded-sm transform rotate-45 animate-quantum-bounce"
                    style={{ animationDelay: `${i * 200}ms` }}
                />
            ))}
        </div>
    );
}

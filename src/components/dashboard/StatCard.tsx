"use client";

import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string | number;
    trend?: number;
    subtitle?: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function StatCard({
    icon,
    iconBg,
    label,
    value,
    trend,
    subtitle,
    actionLabel,
    actionHref,
}: StatCardProps) {
    const isPositive = trend !== undefined && trend >= 0;

    return (
        <div className="flex flex-1 items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 animate-slide-up">
            {/* Icon */}
            <div
                className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    iconBg
                )}
            >
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    {trend !== undefined && (
                        <div
                            className={cn(
                                "flex items-center gap-0.5 text-xs font-semibold",
                                isPositive ? "text-emerald-500" : "text-red-500"
                            )}
                        >
                            {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {isPositive ? "+" : ""}
                            {trend.toFixed(1)}%
                        </div>
                    )}
                    {subtitle && !trend && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</span>
                    )}
                    {actionLabel && actionHref && (
                        <Link
                            href={actionHref}
                            className="text-xs font-semibold text-[#1a6fdb] hover:underline"
                        >
                            {actionLabel}
                        </Link>
                    )}
                </div>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    );
}

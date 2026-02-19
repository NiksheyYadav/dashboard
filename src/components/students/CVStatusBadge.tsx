import { CVStatus } from "@/lib/types/student";
import { cn } from "@/lib/utils";

interface CVStatusBadgeProps {
    status: CVStatus;
}

const statusConfig: Record<CVStatus, { label: string; className: string }> = {
    UPLOADED: {
        label: "UPLOADED",
        className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    PENDING: {
        label: "PENDING",
        className: "bg-amber-50 text-amber-600 border-amber-200",
    },
    REJECTED: {
        label: "REJECTED",
        className: "bg-red-50 text-red-600 border-red-200",
    },
};

export default function CVStatusBadge({ status }: CVStatusBadgeProps) {
    const config = statusConfig[status];
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                config.className
            )}
        >
            {config.label}
        </span>
    );
}

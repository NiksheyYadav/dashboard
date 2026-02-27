import { CVStatus, StudentStatus } from "@/lib/types/student";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: StudentStatus | CVStatus;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    Active: {
        label: "Active",
        className: "bg-emerald-50 text-emerald-600",
    },
    Inactive: {
        label: "Inactive",
        className: "bg-gray-100 text-gray-500",
    },
    UPLOADED: {
        label: "Uploaded",
        className: "bg-emerald-50 text-emerald-600",
    },
    PENDING: {
        label: "Pending",
        className: "bg-amber-50 text-amber-600",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-50 text-red-500",
    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className
            )}
        >
            {config.label}
        </span>
    );
}

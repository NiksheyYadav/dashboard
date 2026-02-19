import { StudentStatus } from "@/lib/types/student";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: StudentStatus;
}

const statusConfig: Record<StudentStatus, { label: string; className: string }> = {
    Active: {
        label: "Active",
        className: "bg-emerald-50 text-emerald-600",
    },
    Inactive: {
        label: "Inactive",
        className: "bg-gray-100 text-gray-500",
    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];
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

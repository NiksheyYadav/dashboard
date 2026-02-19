import { LucideIcon } from "lucide-react";

interface ValidationInfoCardProps {
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
}

export default function ValidationInfoCard({
    icon: Icon,
    iconColor,
    iconBg,
    title,
    description,
}: ValidationInfoCardProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
            >
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {description}
            </p>
        </div>
    );
}

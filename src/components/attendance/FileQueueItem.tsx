import { UploadedFile } from "@/lib/types/attendance-upload";
import { FileSpreadsheet, Trash2 } from "lucide-react";

interface FileQueueItemProps {
    file: UploadedFile;
    onRemove: (id: string) => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const statusLabel: Record<UploadedFile["status"], { text: string; color: string }> = {
    queued: { text: "Ready to process", color: "text-emerald-500" },
    processing: { text: "Processing...", color: "text-blue-500" },
    done: { text: "Completed", color: "text-emerald-600" },
    error: { text: "Error", color: "text-red-500" },
};

export default function FileQueueItem({ file, onRemove }: FileQueueItemProps) {
    const status = statusLabel[file.status];

    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
            {/* CSV icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-gray-900">
                        {file.name}
                    </p>
                    <div className="ml-3 flex items-center gap-3">
                        <span className={`text-xs font-medium ${status.color}`}>
                            {status.text}
                        </span>
                        <span className="text-xs text-gray-400">
                            {formatFileSize(file.size)}
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${file.progress}%` }}
                    />
                </div>
            </div>

            {/* Delete */}
            <button
                onClick={() => onRemove(file.id)}
                className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

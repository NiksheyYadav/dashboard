"use client";

import { CloudUpload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface FileDropZoneProps {
    onFilesSelected: (files: File[]) => void;
    accept?: string;
    maxSizeMB?: number;
}

export default function FileDropZone({
    onFilesSelected,
    accept = ".csv",
    maxSizeMB = 10,
}: FileDropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(
        (fileList: FileList) => {
            const valid: File[] = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (file.size <= maxSizeMB * 1024 * 1024) {
                    valid.push(file);
                }
            }
            if (valid.length > 0) onFilesSelected(valid);
        },
        [maxSizeMB, onFilesSelected]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${isDragOver
                    ? "border-[#1a6fdb] bg-blue-50/50"
                    : "border-gray-200 bg-gray-50/30 hover:border-gray-300"
                }`}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <CloudUpload className="h-7 w-7 text-gray-500" />
            </div>

            <p className="mt-4 text-base font-semibold text-gray-800">
                Click or drag CSV file to upload
            </p>
            <p className="mt-1 text-sm text-gray-400">
                Support for .csv files only (Max size {maxSizeMB}MB)
            </p>

            <button
                onClick={() => inputRef.current?.click()}
                className="mt-4 text-sm font-semibold text-[#1a6fdb] hover:underline"
            >
                Select File from Computer
            </button>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

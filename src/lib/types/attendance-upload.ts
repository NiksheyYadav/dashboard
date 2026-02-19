export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    status: "queued" | "processing" | "done" | "error";
    progress: number;
}

export interface BulkUploadResponse {
    processed: number;
    duplicates: number;
    errors: string[];
}

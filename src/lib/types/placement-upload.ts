export interface PlacementRecord {
    id: string;
    sl_no: number | null;
    roll_no: string;
    student_name: string;
    photo_id: string | null;
    gender: string | null;
    type: string | null;
    contact_no: string | null;
    email: string | null;
    x_result: string | null;
    xii_result: string | null;
    course: string | null;
    branch: string | null;
    designation: string | null;
    company_name: string | null;
    industry: string | null;
    date_of_drive: string | null;
    company_offers: string | null;
    probation_duration: string | null;
    stipend_per_month: string | null;
    package: string | null;
    offer_letter: string | null;
    hr_contact: string | null;
}

export interface PlacementUploadError {
    row: number;
    message: string;
}

export interface PlacementUploadResponse {
    processed: number;
    skipped: number;
    errors: PlacementUploadError[];
}

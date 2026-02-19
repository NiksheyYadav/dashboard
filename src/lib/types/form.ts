export type FormFieldType = "text" | "textarea" | "radio" | "checkbox" | "dropdown" | "scale";

export interface FormFieldOption {
    id: string;
    label: string;
}

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    required: boolean;
    options?: FormFieldOption[];
    scaleMin?: number;
    scaleMax?: number;
}

export interface FormDefinition {
    id: string;
    title: string;
    description: string;
    fields: FormField[];
    targetCourse: string;
    targetSemester: number | "all";
    createdBy: string;
    createdAt: string;
    deadline: string;
    isActive: boolean;
}

export interface FormResponse {
    id: string;
    formId: string;
    studentId: string;
    studentName: string;
    answers: Record<string, string | string[]>;
    submittedAt: string;
}

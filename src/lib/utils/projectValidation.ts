import { ProjectStatus, ProjectType } from "@/lib/types/project";
import { z } from "zod";

export const ProjectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  type: z.enum(["Research", "Dev", "Industry", "Other"] as const),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must not exceed 5000 characters"),
  startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid start date"),
  endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid end date"),
  pptFile: z.instanceof(File).optional().refine(
    (file) => !file || file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "Only .pptx files are allowed"
  ).refine(
    (file) => !file || file.size <= 10 * 1024 * 1024,
    "File size must not exceed 10MB"
  ),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type ProjectFormInputs = z.infer<typeof ProjectFormSchema>;

export const validateProjectForm = (data: unknown) => {
  try {
    const validated = ProjectFormSchema.parse(data);
    return { valid: true, data: validated, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { valid: false, data: null, errors };
    }
    return { valid: false, data: null, errors: { general: "Validation failed" } };
  }
};

export const validatePPTFile = (file: File | undefined): { valid: boolean; error?: string } => {
  if (!file) return { valid: true };
  
  if (file.type !== "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    return { valid: false, error: "Only .pptx files are allowed" };
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File size must not exceed 10MB" };
  }
  
  return { valid: true };
};

export const formatProjectType = (type: ProjectType): string => {
  const formatMap: Record<ProjectType, string> = {
    Research: "Research",
    Dev: "Development",
    Industry: "Industry",
    Other: "Other",
  };
  return formatMap[type] || type;
};

export const formatProjectStatus = (status: ProjectStatus): string => {
  const formatMap: Record<ProjectStatus, string> = {
    "Pending Approval": "Pending Approval",
    Active: "Active",
    Completed: "Completed",
    Rejected: "Rejected",
  };
  return formatMap[status] || status;
};

export const getStatusBadgeColor = (status: ProjectStatus): string => {
  const colorMap: Record<ProjectStatus, string> = {
    "Pending Approval": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    Rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };
  return colorMap[status];
};

export const getTypeBadgeColor = (type: ProjectType): string => {
  const colorMap: Record<ProjectType, string> = {
    Research: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    Dev: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    Industry: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    Other: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400",
  };
  return colorMap[type];
};

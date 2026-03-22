export type ProjectType = "Research" | "Dev" | "Industry" | "Other";
export type ProjectStatus = "Pending Approval" | "Active" | "Completed" | "Rejected";
export type ProjectFlow = "internal" | "external";

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  institution?: string;
  role: "internal" | "external";
}

export interface AssignedStudent {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  department: string;
}

export interface ExternalFacultyFormData {
  name: string;
  email: string;
  department: string;
  institution: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  description: string;
  startDate: string;
  endDate: string;
  pptFile?: { name: string; url: string; uploadedAt: string; };
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  flow: ProjectFlow;                           // "internal" or "external"
  facultyCoordinator: Faculty;                 // 🏫 Internal coordinator (manages approvals & enrollment)
  externalFaculty?: Faculty;                   // 🌐 Outside faculty (optional, only for external flow)
  approvalSubmittedBy: string;                 // Always facultyCoordinator.id
  assignedStudents: AssignedStudent[];
  rejectionReason?: string;
  notes?: string;
}

export interface ProjectFormData {
  title: string;
  type: ProjectType;
  description: string;
  startDate: string;
  endDate: string;
  pptFile?: File;
  flow: ProjectFlow;                       // "internal" or "external"
  externalFaculty?: ExternalFacultyFormData; // Only for external flow
}

export interface ProjectFilters {
  status?: ProjectStatus;
  type?: ProjectType;
  searchTerm?: string;
  isExternalCollaboration?: boolean;
}

export interface ProjectsQueryParams extends ProjectFilters {
  page?: number;
  limit?: number;
}

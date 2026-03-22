"use client";

import * as projectsApi from "@/lib/api/projects";
import { AssignedStudent, Project, ProjectFilters, ProjectFormData } from "@/lib/types/project";
import { create } from "zustand";

interface ProjectStore {
  projects: Project[];
  filters: ProjectFilters;
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Project Management
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  fetchProjectById: (id: string) => Promise<Project | undefined>;
  createProject: (data: ProjectFormData) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<ProjectFormData>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  
  // Filtering & Searching
  setFilters: (filters: ProjectFilters) => void;
  
  // Student Assignment
  addStudentToProject: (projectId: string, student: AssignedStudent) => Promise<Project | null>;
  removeStudentFromProject: (projectId: string, studentId: string) => Promise<Project | null>;
  
  // Status Updates
  approveProject: (id: string) => Promise<Project | null>;
  rejectProject: (id: string, reason: string) => Promise<Project | null>;
  completeProject: (id: string) => Promise<Project | null>;
  
  // UI State
  setSelectedProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data for initial state
const mockProjects: Project[] = [
  {
    id: "proj-1",
    title: "AI-Powered Disease Detection",
    type: "Research",
    description: "Using machine learning to detect diseases from medical imaging",
    startDate: "2025-01-15",
    endDate: "2025-06-30",
    status: "Active",
    createdBy: "faculty-1",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-10",
    flow: "external",
    facultyCoordinator: {
      id: "faculty-1",
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@college.edu",
      department: "CS",
      role: "internal",
    },
    externalFaculty: {
      id: "ext-faculty-1",
      name: "Prof. Ankit Verma",
      email: "ankit.verma@iitd.ac.in",
      department: "Biomedical Engineering",
      institution: "IIT Delhi",
      role: "external",
    },
    approvalSubmittedBy: "faculty-1",
    assignedStudents: [
      {
        id: "student-1",
        name: "Amit Sharma",
        rollNo: "CSE001",
        email: "amit@college.edu",
        department: "CS",
      },
      {
        id: "student-2",
        name: "Priya Singh",
        rollNo: "CSE002",
        email: "priya@college.edu",
        department: "CS",
      },
    ],
    pptFile: {
      name: "presentation.pptx",
      url: "/uploads/presentation.pptx",
      uploadedAt: "2025-01-10",
    },
  },
  {
    id: "proj-2",
    title: "Mobile App Development",
    type: "Dev",
    description: "Building a cross-platform mobile application for student management",
    startDate: "2025-02-01",
    endDate: "2025-05-31",
    status: "Pending Approval",
    createdBy: "faculty-2",
    createdAt: "2025-02-05",
    updatedAt: "2025-02-05",
    flow: "internal",
    facultyCoordinator: {
      id: "faculty-2",
      name: "Prof. Meera Joshi",
      email: "meera.joshi@college.edu",
      department: "CS",
      role: "internal",
    },
    approvalSubmittedBy: "faculty-2",
    assignedStudents: [],
  },
];

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  filters: {},
  selectedProject: null,
  isLoading: false,
  error: null,

  // Project Management
  fetchProjects: async (filters?: ProjectFilters) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsApi.getProjects({
        status: filters?.status,
        type: filters?.type,
        search: filters?.searchTerm,
      });
      set({ projects, filters: filters || {} });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch projects";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.getProjectById(id);
      set({ selectedProject: project });
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch project";
      set({ error: message });
      return undefined;
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (data: ProjectFormData) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.createProject(data);
      set((state) => ({
        projects: [...state.projects, project],
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create project";
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (id: string, updates: Partial<ProjectFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.updateProject(id, updates);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? project : p)),
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update project";
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await projectsApi.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      set({ error: message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Filtering & Searching
  setFilters: (filters: ProjectFilters) => {
    set({ filters });
  },

  // Student Assignment
  addStudentToProject: async (projectId: string, student: AssignedStudent) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.addStudentToProject(projectId, student);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? project : p)),
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add student";
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  removeStudentFromProject: async (projectId: string, studentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.removeStudentFromProject(projectId, studentId);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? project : p)),
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove student";
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Status Updates
  approveProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.approveProject(id);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? project : p)),
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve project";
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectProject: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.rejectProject(id, reason);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? project : p)),
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject project";
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  completeProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.completeProject(id);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? project : p)),
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete project";
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // UI State
  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

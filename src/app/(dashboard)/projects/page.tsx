"use client";

import ProjectCard from "@/components/projects/ProjectCard";
import ProjectDetailModal from "@/components/projects/ProjectDetailModal";
import ProjectFiltersComponent from "@/components/projects/ProjectFilters";
import ProjectForm from "@/components/projects/ProjectForm";
import StudentAssignmentDialog from "@/components/projects/StudentAssignmentDialog";
import { Button } from "@/components/ui/button";
import SimpleDialog from "@/components/ui/modal";
import { useAuth } from "@/lib/auth/auth-context";
import { useProjectStore } from "@/lib/stores/projectStore";
import { AssignedStudent, Project, ProjectFilters, ProjectFormData } from "@/lib/types/project";
import { AlertCircle, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ProjectsPage() {
  const { user, role } = useAuth();
  const projectStore = useProjectStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [rejectingProject, setRejectingProject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string>("");

  // Fetch projects on mount
  useEffect(() => {
    projectStore.fetchProjects();
  }, [projectStore]);

  // Get filtered projects
  const filteredProjects = projectStore.projects.filter((project) => {
    if (projectStore.filters.status && project.status !== projectStore.filters.status) return false;
    if (projectStore.filters.type && project.type !== projectStore.filters.type) return false;
    if (
      projectStore.filters.searchTerm &&
      !project.title.toLowerCase().includes(projectStore.filters.searchTerm.toLowerCase()) &&
      !project.description.toLowerCase().includes(projectStore.filters.searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Determine if user can create projects
  const canCreateProject = role === "admin" || role === "dean" || role === "hod" || role === "faculty" || role === "coordinator";

  const handleCreateProject = useCallback(
    async (data: ProjectFormData) => {
      setError("");
      const result = await projectStore.createProject(data);
      if (!result) {
        setError(projectStore.error || "Failed to create project");
      } else {
        setShowCreateForm(false);
      }
    },
    [projectStore]
  );

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleApproveProject = async (projectId: string) => {
    const result = await projectStore.approveProject(projectId);
    if (result) {
      setShowDetailModal(false);
    } else {
      setError(projectStore.error || "Failed to approve project");
    }
  };

  const handleRejectProject = (projectId: string) => {
    setRejectingProject(projectId);
  };

  const handleConfirmReject = async () => {
    if (rejectingProject && rejectReason.trim()) {
      const result = await projectStore.rejectProject(rejectingProject, rejectReason);
      if (result) {
        setRejectingProject(null);
        setRejectReason("");
        setShowDetailModal(false);
      } else {
        setError(projectStore.error || "Failed to reject project");
      }
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      const result = await projectStore.deleteProject(project.id);
      if (!result) {
        setError(projectStore.error || "Failed to delete project");
      }
    }
  };

  const handleAssignStudents = (project: Project) => {
    setSelectedProject(project);
    setShowAssignmentDialog(true);
  };

  const handleAddStudent = async (student: AssignedStudent) => {
    if (selectedProject) {
      const result = await projectStore.addStudentToProject(selectedProject.id, student);
      if (result) {
        setSelectedProject(result);
      } else {
        setError(projectStore.error || "Failed to add student");
      }
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (selectedProject) {
      const result = await projectStore.removeStudentFromProject(selectedProject.id, studentId);
      if (result) {
        setSelectedProject(result);
      } else {
        setError(projectStore.error || "Failed to remove student");
      }
    }
  };

  const handleFilterChange = (filters: ProjectFilters) => {
    projectStore.setFilters(filters);
  };

  const handleResetFilters = () => {
    projectStore.setFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage and track academic projects across the institution
          </p>
        </div>
        {canCreateProject && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="gap-2 w-fit"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <ProjectFiltersComponent
        filters={projectStore.filters}
        onFiltersChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            {projectStore.projects.length === 0
              ? "No projects yet. Create one to get started!"
              : "No projects match your filters"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={handleSelectProject}
              onEdit={() => {
                setSelectedProject(project);
                setShowDetailModal(true);
              }}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <SimpleDialog isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Create New Project
          </h2>
          <ProjectForm
            onSubmit={handleCreateProject}
            isLoading={projectStore.isLoading}
            error={error}
          />
        </div>
      </SimpleDialog>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          isOpen={showDetailModal}
          project={selectedProject}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProject(null);
            setRejectingProject(null);
            setRejectReason("");
          }}
          onApprove={handleApproveProject}
          onReject={handleRejectProject}
          onAssignStudents={handleAssignStudents}
          isLoading={projectStore.isLoading}
        />
      )}

      {/* Reject Reason Dialog */}
      <SimpleDialog
        isOpen={rejectingProject != null}
        onClose={() => {
          setRejectingProject(null);
          setRejectReason("");
        }}
      >
        <div className="w-full max-w-md">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Reject Project
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please provide a reason for rejecting this project. The faculty will be notified.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            rows={4}
          />
          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingProject(null);
                setRejectReason("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Reject
            </Button>
          </div>
        </div>
      </SimpleDialog>

      {/* Student Assignment Dialog */}
      {selectedProject && (
        <StudentAssignmentDialog
          isOpen={showAssignmentDialog}
          onClose={() => setShowAssignmentDialog(false)}
          projectTitle={selectedProject.title}
          assignedStudents={selectedProject.assignedStudents}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
          isLoading={projectStore.isLoading}
        />
      )}
    </div>
  );
}

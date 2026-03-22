"use client";

import { Button } from "@/components/ui/button";
import SimpleDialog from "@/components/ui/modal";
import { useAuth } from "@/lib/auth/auth-context";
import { Project } from "@/lib/types/project";
import { AlertCircle, Calendar, Download, Edit2, FileText, Users, X } from "lucide-react";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectTypeBadge from "./ProjectTypeBadge";

interface ProjectDetailModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onEdit?: (project: Project) => void;
  onAssignStudents?: (project: Project) => void;
  onApprove?: (projectId: string) => void;
  onReject?: (projectId: string) => void;
  isLoading?: boolean;
}

export default function ProjectDetailModal({
  isOpen,
  project,
  onClose,
  onEdit,
  onAssignStudents,
  onApprove,
  onReject,
  isLoading = false,
}: ProjectDetailModalProps) {
  const { role, user } = useAuth();

  if (!project) return null;

  const canEdit = role === "admin" || role === "dean" || role === "hod" || project.createdBy === user?.id;
  const canApprove = role === "admin" || role === "dean";
  const isPending = project.status === "Pending Approval";
  const isExternal = project.flow === "external" && project.externalFaculty != null;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {project.title}
              </h2>
              <ProjectStatusBadge status={project.status} />
            </div>
            <ProjectTypeBadge type={project.type} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Description */}
        <div className="mb-6 space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Description</h3>
          <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
        </div>

        {/* Project Details Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Start Date</p>
            <p className="mt-1 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <Calendar className="h-4 w-4" />
              {new Date(project.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">End Date</p>
            <p className="mt-1 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <Calendar className="h-4 w-4" />
              {new Date(project.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Students</p>
            <p className="mt-1 flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
              <Users className="h-4 w-4" />
              {project.assignedStudents.length}
            </p>
          </div>
        </div>

        {/* Faculty Information */}
        <div className="mb-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Faculty Information</h3>
          
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">🏫 Faculty Coordinator</p>
            <p className="mt-1 text-gray-900 dark:text-gray-100">{project.facultyCoordinator.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {project.facultyCoordinator.department} | {project.facultyCoordinator.email}
            </p>
          </div>

          {project.flow === "external" && project.externalFaculty && (
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/20">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-300">🌐 External Faculty</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{project.externalFaculty.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.externalFaculty.department} | {project.externalFaculty.email}
              </p>
            </div>
          )}
        </div>

        {/* Assigned Students */}
        {project.assignedStudents.length > 0 && (
          <div className="mb-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Assigned Students ({project.assignedStudents.length})
            </h3>
            <div className="space-y-2">
              {project.assignedStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.rollNo} • {student.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PPT File */}
        {project.pptFile && (
          <div className="mb-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Presentation File</h3>
            <a
              href={project.pptFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 p-3 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/20 dark:hover:bg-blue-950/40"
            >
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-blue-900 dark:text-blue-300">
                  {project.pptFile.name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Uploaded {new Date(project.pptFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </a>
          </div>
        )}

        {/* Rejection Reason */}
        {project.status === "Rejected" && project.rejectionReason && (
          <div className="mb-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Rejection Reason
            </h3>
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
              <p className="text-gray-900 dark:text-gray-100">{project.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {project.notes && (
          <div className="mb-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notes</h3>
            <p className="text-gray-700 dark:text-gray-300">{project.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button
                onClick={() => onEdit?.(project)}
                disabled={isLoading}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            )}

            {isPending && canApprove && (
              <>
                <Button
                  onClick={() => onApprove?.(project.id)}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => onReject?.(project.id)}
                  disabled={isLoading}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Reject
                </Button>
              </>
            )}

            {project.status === "Active" && (
              <Button
                onClick={() => onAssignStudents?.(project)}
                disabled={isLoading}
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </SimpleDialog>
  );
}

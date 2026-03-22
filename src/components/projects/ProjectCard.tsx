"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { Project } from "@/lib/types/project";
import { Calendar, FileText, Users } from "lucide-react";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectTypeBadge from "./ProjectTypeBadge";

interface ProjectCardProps {
  project: Project;
  onSelect?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onSelect,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const { role, user } = useAuth();
  const canEdit = role === "admin" || role === "dean" || role === "hod" || project.createdBy === user?.id;
  const isExternal = project.flow === "external" && project.externalFaculty != null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        <ProjectTypeBadge type={project.type} />
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Faculty Information */}
      <div className="mb-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-800">
        <div className="text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">🏫 Faculty Coordinator:</span>
          <p className="text-gray-600 dark:text-gray-400">
            {project.facultyCoordinator.name} ({project.facultyCoordinator.department})
          </p>
        </div>
        {project.flow === "external" && project.externalFaculty && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">🌐 External Faculty:</span>
            <p className="text-gray-600 dark:text-gray-400">
              {project.externalFaculty.name} ({project.externalFaculty.department})
            </p>
          </div>
        )}
      </div>

      {/* Project Details */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(project.startDate).toLocaleDateString()} -{" "}
            {new Date(project.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{project.assignedStudents.length} students</span>
        </div>
      </div>

      {/* PPT File */}
      {project.pptFile && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-gray-50 p-2 text-sm dark:bg-gray-800/50">
          <FileText className="h-4 w-4 text-blue-600" />
          <a
            href={project.pptFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {project.pptFile.name}
          </a>
        </div>
      )}

      {/* Rejection Reason */}
      {project.status === "Rejected" && project.rejectionReason && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm dark:bg-red-900/20">
          <p className="font-medium text-red-700 dark:text-red-400">Rejection Reason:</p>
          <p className="text-red-600 dark:text-red-300">{project.rejectionReason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect?.(project)}
          className="flex-1"
        >
          View Details
        </Button>
        {canEdit && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(project)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(project)}
              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

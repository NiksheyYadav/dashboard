"use client";

import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/lib/types/project";
import { formatProjectStatus, getStatusBadgeColor } from "@/lib/utils/projectValidation";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <Badge variant="outline" className={getStatusBadgeColor(status)}>
      {formatProjectStatus(status)}
    </Badge>
  );
}

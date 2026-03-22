"use client";

import { Badge } from "@/components/ui/badge";
import { ProjectType } from "@/lib/types/project";
import { formatProjectType, getTypeBadgeColor } from "@/lib/utils/projectValidation";

interface ProjectTypeBadgeProps {
  type: ProjectType;
}

export default function ProjectTypeBadge({ type }: ProjectTypeBadgeProps) {
  return (
    <Badge variant="outline" className={getTypeBadgeColor(type)}>
      {formatProjectType(type)}
    </Badge>
  );
}

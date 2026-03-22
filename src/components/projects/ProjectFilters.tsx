"use client";

import { Button } from "@/components/ui/button";
import { ProjectFilters, ProjectStatus, ProjectType } from "@/lib/types/project";
import { Search, X } from "lucide-react";

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onReset?: () => void;
}

const PROJECT_STATUSES: ProjectStatus[] = ["Pending Approval", "Active", "Completed", "Rejected"];
const PROJECT_TYPES: ProjectType[] = ["Research", "Dev", "Industry", "Other"];

export default function ProjectFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: ProjectFiltersProps) {
  const hasActiveFilters = filters.status || filters.type || filters.searchTerm;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects by title or description..."
          value={filters.searchTerm || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              searchTerm: e.target.value || undefined,
            })
          }
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        {/* Status Filter */}
        <div className="flex-1">
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value as ProjectStatus) || undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 text-sm"
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex-1">
          <select
            value={filters.type || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                type: (e.target.value as ProjectType) || undefined,
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 text-sm"
          >
            <option value="">All Types</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "Dev" ? "Development" : type}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

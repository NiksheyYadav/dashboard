"use client";

import { Button } from "@/components/ui/button";
import { ExternalFacultyFormData, ProjectFlow, ProjectFormData, ProjectType } from "@/lib/types/project";
import { validatePPTFile, validateProjectForm } from "@/lib/utils/projectValidation";
import { Building2, Upload, X } from "lucide-react";
import { useState } from "react";

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function ProjectForm({ initialData, onSubmit, isLoading = false, error: externalError }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    type: initialData?.type || ("Dev" as ProjectType),
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    flow: initialData?.flow || ("internal" as ProjectFlow),
  });

  const [externalFaculty, setExternalFaculty] = useState<ExternalFacultyFormData>({
    name: initialData?.externalFaculty?.name || "",
    email: initialData?.externalFaculty?.email || "",
    department: initialData?.externalFaculty?.department || "",
    institution: initialData?.externalFaculty?.institution || "",
  });

  const [pptFile, setPptFile] = useState<File | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validatePPTFile(file);
    if (!validation.valid) { setFileError(validation.error || "Invalid file"); setPptFile(undefined); return; }
    setFileError(""); setPptFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); setFileError("");
    const payload: ProjectFormData = {
      ...formData,
      pptFile,
      externalFaculty: formData.flow === "external" ? externalFaculty : undefined,
    };
    const validation = validateProjectForm(payload);
    if (!validation.valid) { setErrors(validation.errors); return; }
    try { await onSubmit(payload); }
    catch (err) { setErrors({ general: err instanceof Error ? err.message : "An error occurred" }); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(externalError || errors.general) && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {externalError || errors.general}
        </div>
      )}

      {/* Project Flow Toggle */}
      <div className="flex gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Flow *</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, flow: "internal" })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              formData.flow === "internal"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            }`}
            disabled={isLoading}
          >
            🏫 Internal
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, flow: "external" })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              formData.flow === "external"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            }`}
            disabled={isLoading}
          >
            🌐 External
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Title *</label>
        <input type="text" value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Enter project title" disabled={isLoading} />
        {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Type *</label>
        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          disabled={isLoading}>
          <option value="Research">Research</option>
          <option value="Dev">Development</option>
          <option value="Industry">Industry</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Enter project description" rows={4} disabled={isLoading} />
        {errors.description && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date *</label>
          <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            disabled={isLoading} />
          {errors.startDate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.startDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date *</label>
          <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            disabled={isLoading} />
          {errors.endDate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.endDate}</p>}
        </div>
      </div>

      {/* External Faculty Fields — only shown when flow is "external" */}
      {formData.flow === "external" && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 space-y-4 dark:border-purple-900/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              🌐 External Faculty Details
            </p>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 -mt-2">
            Jis bahar ki faculty ne aapse contact kiya, unki details fill karo
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
              <input type="text" value={externalFaculty.name}
                onChange={(e) => setExternalFaculty({ ...externalFaculty, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Dr. Ramesh Gupta" disabled={isLoading} />
              {errors.externalName && <p className="mt-1 text-xs text-red-600">{errors.externalName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Email *</label>
              <input type="email" value={externalFaculty.email}
                onChange={(e) => setExternalFaculty({ ...externalFaculty, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="ramesh@iit.ac.in" disabled={isLoading} />
              {errors.externalEmail && <p className="mt-1 text-xs text-red-600">{errors.externalEmail}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Department *</label>
              <input type="text" value={externalFaculty.department}
                onChange={(e) => setExternalFaculty({ ...externalFaculty, department: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Computer Science" disabled={isLoading} />
              {errors.externalDept && <p className="mt-1 text-xs text-red-600">{errors.externalDept}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Institution *</label>
              <input type="text" value={externalFaculty.institution}
                onChange={(e) => setExternalFaculty({ ...externalFaculty, institution: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="IIT Delhi / TCS / etc." disabled={isLoading} />
              {errors.externalInst && <p className="mt-1 text-xs text-red-600">{errors.externalInst}</p>}
            </div>
          </div>
        </div>
      )}

      {/* PPT Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Presentation (.pptx) — Max 10MB
        </label>
        <div className="mt-1.5">
          {pptFile ? (
            <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-300">{pptFile.name}</span>
              </div>
              <button type="button" onClick={() => setPptFile(undefined)} className="text-green-600 hover:text-green-700 dark:text-green-400">
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-950/20">
              <input type="file" accept=".pptx" onChange={handleFileChange} className="hidden" disabled={isLoading} />
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PPTX only, max 10MB</p>
              </div>
            </label>
          )}
          {fileError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fileError}</p>}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Submit Project"}
        </Button>
      </div>
    </form>
  );
}

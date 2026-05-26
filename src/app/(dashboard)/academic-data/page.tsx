"use client";

import React, { useState, useRef } from "react";
import RequireRole from "@/components/providers/RequireRole";
import { 
  Download, UploadCloud, FileSpreadsheet, CheckCircle2, 
  XCircle, AlertTriangle, FileUp, RefreshCcw, FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiUrl, API_BASE } from "@/lib/api/config";

export default function AcademicDataPage() {
  return (
    <RequireRole allowedRoles={["admin", "dean", "hod"]}>
      <AcademicDataContent />
    </RequireRole>
  );
}

function AcademicDataContent() {
  const [activeTab, setActiveTab] = useState<"import" | "history">("import");
  const [selectedType, setSelectedType] = useState("timetable");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ valid: number; errors: number; warnings: number; rows: { row: number; status: string; detail: string }[] } | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateTypes = [
    { id: "timetable", name: "Timetable & Slots", icon: <FileText className="w-5 h-5 text-blue-500" /> },
    { id: "faculty", name: "Faculty Mapping", icon: <FileSpreadsheet className="w-5 h-5 text-green-500" /> },
    { id: "subjects", name: "Subject Allocation", icon: <FileText className="w-5 h-5 text-purple-500" /> },
    { id: "mentors", name: "Mentor Mapping", icon: <FileSpreadsheet className="w-5 h-5 text-orange-500" /> },
    { id: "students", name: "Student Master", icon: <FileText className="w-5 h-5 text-indigo-500" /> },
  ];

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem("edupulse_auth_token");
      const res = await fetch(`${API_BASE}/academic/template/${selectedType}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedType}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setActionMessage("Template download failed. Backend may not be running.");
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate preview (in production, upload to backend for validation)
      setPreviewData({
        valid: 142, errors: 3, warnings: 5,
        rows: [
          { row: 14, status: "Error", detail: "Faculty 'john.doe@sgt.edu' not found in system" },
          { row: 42, status: "Error", detail: "Slot clash: Room 302 already booked for CSE-5B" },
          { row: 88, status: "Warning", detail: "Missing lab group mapping, defaulting to entire section" },
        ]
      });
      setImportId("mock-import-id");
    }
  };

  const commitData = async () => {
    if (!importId) return;
    try {
      const token = localStorage.getItem("edupulse_auth_token");
      const res = await fetch(`${API_BASE}/academic/import/${importId}/commit`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Commit failed");
      setActionMessage("Data committed successfully!");
      setTimeout(() => setActionMessage(null), 3000);
      setPreviewData(null);
      setSelectedFile(null);
      setImportId(null);
    } catch {
      setActionMessage("Commit failed. Backend may not be running.");
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const cancelPreview = () => {
    setPreviewData(null);
    setSelectedFile(null);
    setImportId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const rollbackImport = async (id: string) => {
    try {
      const token = localStorage.getItem("edupulse_auth_token");
      const res = await fetch(`${API_BASE}/academic/import/${id}/rollback`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Rollback failed");
      setActionMessage("Import rolled back successfully!");
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      setActionMessage("Rollback failed. Backend may not be running.");
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Data Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Import and manage master templates for SOET</p>
        </div>
        {actionMessage && <div className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">{actionMessage}</div>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("import")}
          className={`py-3 px-6 text-sm font-medium border-b-2 ${
            activeTab === "import"
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Data Import
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 px-6 text-sm font-medium border-b-2 ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Import History
        </button>
      </div>

      {activeTab === "import" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Template Selection & Download */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0a1628] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Select Data Type</h2>
              <div className="space-y-2">
                {templateTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                      selectedType === t.id 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                      : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {t.icon}
                      <span className="font-medium">{t.name}</span>
                    </div>
                    {selectedType === t.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Need the template format? Download it here:
                </p>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={downloadTemplate}>
                  <Download className="w-4 h-4" />
                  Download {templateTypes.find(t => t.id === selectedType)?.name} Template
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0a1628] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2. Upload File</h2>
              
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.csv,.pdf" className="hidden" />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {selectedFile ? selectedFile.name : "Drag & Drop file here"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "or click to browse your computer (XLSX, CSV)"}
                </p>
                <Button>
                  Select File
                </Button>
              </div>
            </div>

            {/* Validation Preview */}
            {previewData && (
            <div className="bg-white dark:bg-[#0a1628] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. Validation Preview</h2>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Pending Commit
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-green-50 border border-green-100 dark:bg-green-900/10 dark:border-green-900/30 flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{previewData.valid}</div>
                    <div className="text-sm text-green-600 dark:text-green-500">Valid Rows</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30 flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">{previewData.errors}</div>
                    <div className="text-sm text-red-600 dark:text-red-500">Errors</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{previewData.warnings}</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-500">Warnings</div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden dark:border-gray-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">Row</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0a1628]">
                    {previewData.rows.map((r, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium">Row {r.row}</td>
                        <td className="px-4 py-3">
                          <Badge className={r.status === "Error" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={cancelPreview}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={commitData}>
                  <FileUp className="w-4 h-4" />
                  Commit Valid Data
                </Button>
              </div>
            </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0a1628] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Imports</h2>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => {
                setActionMessage("Refreshing import history...");
                setTimeout(() => setActionMessage(null), 2000);
            }}>
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden dark:border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">File Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Records</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0a1628]">
                <tr>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Oct 24, 2024 10:30 AM</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Timetable_CSE_Sem5.pdf</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Timetable</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">240</td>
                  <td className="px-4 py-3"><Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Committed</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => rollbackImport("import-1")}>
                      Rollback
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Oct 23, 2024 04:15 PM</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Mentor_Mapping_2024.xlsx</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Mentors</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">850</td>
                  <td className="px-4 py-3"><Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Committed</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => rollbackImport("import-2")}>
                      Rollback
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Oct 20, 2024 11:20 AM</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Student_Master_v2.csv</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Students</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">1200</td>
                  <td className="px-4 py-3"><Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Rolled Back</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" disabled>Rollback</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

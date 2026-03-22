"use client";

import { Button } from "@/components/ui/button";
import SimpleDialog from "@/components/ui/modal";
import { AssignedStudent } from "@/lib/types/project";
import { Users, X } from "lucide-react";
import { useState } from "react";

interface StudentAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  assignedStudents: AssignedStudent[];
  onAddStudent: (student: AssignedStudent) => void;
  onRemoveStudent: (studentId: string) => void;
  isLoading?: boolean;
}

// Mock student list
const MOCK_STUDENTS: AssignedStudent[] = [
  { id: "s1", name: "Amit Sharma", rollNo: "CSE001", email: "amit@college.edu", department: "CS" },
  { id: "s2", name: "Priya Singh", rollNo: "CSE002", email: "priya@college.edu", department: "CS" },
  { id: "s3", name: "Rajesh Kumar", rollNo: "CSE003", email: "rajesh@college.edu", department: "CS" },
  { id: "s4", name: "Neha Verma", rollNo: "CSE004", email: "neha@college.edu", department: "CS" },
  { id: "s5", name: "Vikram Singh", rollNo: "CSE005", email: "vikram@college.edu", department: "CS" },
  { id: "s6", name: "Ananya Kapoor", rollNo: "IT001", email: "ananya@college.edu", department: "IT" },
];

export default function StudentAssignmentDialog({
  isOpen,
  onClose,
  projectTitle,
  assignedStudents,
  onAddStudent,
  onRemoveStudent,
  isLoading = false,
}: StudentAssignmentDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = MOCK_STUDENTS.filter(
    (student) =>
      !assignedStudents.find((s) => s.id === student.id) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStudent = (student: AssignedStudent) => {
    onAddStudent(student);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Assign Students to Project
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {projectTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Search and Add */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Add New Student
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name, roll no, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>

            {/* Suggestions */}
            {searchTerm && filteredStudents.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleAddStudent(student)}
                    className="w-full border-b border-gray-200 px-3 py-2 text-left text-sm hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/20"
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {student.rollNo} • {student.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Students */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Assigned Students ({assignedStudents.length})
              </h3>
            </div>

            {assignedStudents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No students assigned yet
              </p>
            ) : (
              <div className="space-y-2">
                {assignedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {student.rollNo} • {student.email}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveStudent(student.id)}
                      disabled={isLoading}
                      className="ml-2 text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
}

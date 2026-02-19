import { BookOpen } from "lucide-react";

export default function CoursesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                <p className="text-sm text-gray-500">
                    View your enrolled courses and schedules
                </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Course Management
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    This page will display your enrolled courses, timetable,
                    and subject-wise attendance. Connect to backend to populate.
                </p>
            </div>
        </div>
    );
}

import { FileText } from "lucide-react";

export const metadata = {
    title: "Changelog | EduPulse Dashboard",
};

export default function ChangelogPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Changelog
                </h1>
                <p className="mt-2 text-lg text-gray-500">
                    New updates, features, and improvements to the EduPulse dashboard.
                </p>
            </div>

            <div className="space-y-12">
                {/* Version 1.1.0 */}
                <div className="relative border-l border-gray-200 pl-8 pb-12">
                    <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                        <FileText className="h-3 w-3 text-blue-600" />
                    </div>

                    <div className="mb-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                            v1.1.0
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray-400">
                            February 27, 2026
                        </span>
                    </div>

                    <h2 className="mb-6 text-xl font-bold text-gray-900">
                        Production Readiness & Data Integrity
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">
                                ✨ Added
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-emerald-500">
                                <li>
                                    <strong className="text-gray-900">Password UX:</strong> Added
                                    eye/eye-off toggle to show and hide passwords securely.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Password UX:</strong> Added
                                    Caps Lock detection with a warning indicator during login.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Forgot Password:</strong> Built complete flow via email, including reset forms and backend API.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Students Management:</strong> Activated full database CRUD (Create, Read, Update, Delete) capability for real SGT students.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Student Directory:</strong> Wired the page to fetch real data with pagination, searching, and filtering.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-600">
                                🔄 Changed
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-blue-500">
                                <li>
                                    <strong className="text-gray-900">Attendance Access:</strong> Expanded dashboard access allowing Deans and HODs to view the attendance page.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Data Visibility:</strong> Fixed an issue where employee accounts (e.g., Dean, HOD) incorrectly appeared in the Student Directory.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-600">
                                🗑️ Removed
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-orange-500">
                                <li>
                                    <strong className="text-gray-900">Account Lockout:</strong> Removed the 15-minute lockout after 5 failed login attempts to prevent user friction (failed counts are still tracked for security).
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-600">
                                🐛 Fixed
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-gray-500">
                                <li>
                                    <strong className="text-gray-900">Vercel Deployment:</strong> Resolved the "405 Method Not Allowed" routing conflict for POST requests during production deployment.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Version 1.0.0 */}
                <div className="relative border-l border-gray-200 pl-8">
                    <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                        <FileText className="h-3 w-3 text-gray-500" />
                    </div>

                    <div className="mb-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                            v1.0.0
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray-400">
                            Initial Release
                        </span>
                    </div>

                    <h2 className="mb-6 text-xl font-bold text-gray-900">
                        Initial Framework Setup
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">
                                ✨ Added
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-emerald-500">
                                <li>Boilerplate Next.js dashboard template with Tailwind CSS.</li>
                                <li>FastAPI backend template with SQLAlchemy and Alembic.</li>
                                <li>JWT User Authentication, role-based layout, and active sessions tracking.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

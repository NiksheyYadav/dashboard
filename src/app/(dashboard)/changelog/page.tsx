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
                {/* Version 1.3.0 */}
                <div className="relative border-l border-gray-200 pl-8 pb-12">
                    <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 ring-8 ring-white">
                        <FileText className="h-3 w-3 text-purple-600" />
                    </div>

                    <div className="mb-4">
                        <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
                            v1.3.0
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray-400">
                            March 2, 2026
                        </span>
                    </div>

                    <h2 className="mb-6 text-xl font-bold text-gray-900">
                        Projects Module &amp; Flow System
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">
                                ✨ Added
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-emerald-500">
                                <li>
                                    <strong className="text-gray-900">Projects Module:</strong> Complete project management system with CRUD operations and role-based access control.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Project Flow System:</strong> Typed flow classification with <code className="bg-gray-100 px-1 rounded text-sm">&quot;internal&quot; | &quot;external&quot;</code> enum for explicit project type tracking.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Faculty Coordinator:</strong> New field to designate the internal faculty managing project approvals and student enrollment.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Approval Tracking:</strong> Added <code className="bg-gray-100 px-1 rounded text-sm">approvalSubmittedBy</code> field to create an audit trail of who submitted projects for approval.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Project Form:</strong> Interactive form with flow toggle buttons (&quot;🏫 Internal&quot; / &quot;🌐 External&quot;) and conditional external faculty fields.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Project Card View:</strong> List display showing projects with automatic external collaboration detection and coordinator information.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Project Detail Modal:</strong> Detailed project view with support for showing both coordinators and external faculty where applicable.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Student Assignment:</strong> Interface to add and manage students assigned to projects with role-based permissions.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Projects REST API:</strong> 10 REST endpoints for complete project lifecycle management (list, get, create, update, delete, approve, reject, add/remove students, complete).
                                </li>
                                <li>
                                    <strong className="text-gray-900">Database Migration:</strong> Alembic migration <code className="bg-gray-100 px-1 rounded text-sm">20260302_0009</code> to update projects table schema with new fields and column renames.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-600">
                                🔄 Changed
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-blue-500">
                                <li>
                                    <strong className="text-gray-900">Faculty Field Semantics:</strong> Renamed <code className="bg-gray-100 px-1 rounded text-sm">internalFaculty</code> to <code className="bg-gray-100 px-1 rounded text-sm">facultyCoordinator</code> across frontend components and backend models for clarity on role responsibility.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Flow Representation:</strong> Replaced boolean <code className="bg-gray-100 px-1 rounded text-sm">isExternalCollaboration</code> flag with typed <code className="bg-gray-100 px-1 rounded text-sm">ProjectFlow</code> enum for type-safe flow management.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-600">
                                🏗️ Technical Details
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-gray-500">
                                <li>
                                    <strong className="text-gray-900">Frontend Types:</strong> Updated <code className="bg-gray-100 px-1 rounded text-sm">src/lib/types/project.ts</code> with new <code className="bg-gray-100 px-1 rounded text-sm">ProjectFlow</code> type and field structure.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Components Updated:</strong> ProjectForm, ProjectCard, ProjectDetailModal now use new flow system and field names.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Backend Models:</strong> SQLAlchemy Project model and Pydantic ProjectCreate schema updated with new columns and validation.
                                </li>
                                <li>
                                    <strong className="text-gray-900">API Endpoints:</strong> create_project endpoint auto-populates <code className="bg-gray-100 px-1 rounded text-sm">faculty_coordinator</code> from authenticated user context.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Database Schema:</strong> Added <code className="bg-gray-100 px-1 rounded text-sm">flow</code>, renamed <code className="bg-gray-100 px-1 rounded text-sm">internal_faculty → faculty_coordinator</code>, added <code className="bg-gray-100 px-1 rounded text-sm">approval_submitted_by</code> columns.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Version 1.2.0 */}
                <div className="relative border-l border-gray-200 pl-8 pb-12">
                    <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 ring-8 ring-white">
                        <FileText className="h-3 w-3 text-indigo-600" />
                    </div>

                    <div className="mb-4">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                            v1.2.0
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray-400">
                            February 28, 2026
                        </span>
                    </div>

                    <h2 className="mb-6 text-xl font-bold text-gray-900">
                        RBAC Overhaul &amp; Messaging System
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">
                                ✨ Added
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-emerald-500">
                                <li>
                                    <strong className="text-gray-900">Role-Based Access Control:</strong> Full RBAC system with 5 roles — Admin, Dean, HOD, Faculty, and Coordinator. Each role sees only relevant sidebar items and pages.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Coordinator Subtypes:</strong> Coordinators are automatically classified as Placement, Attendance, or Events based on their email prefix, with subtype-specific sidebar filtering.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Events Page:</strong> New &ldquo;Event Room Booking&rdquo; page where Faculty and Coordinators can book rooms for events. Dean and HOD have read-only access.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Anonymous Messaging:</strong> Faculty and Coordinators can send anonymous feedback to the Dean. Messages are fully untraceable — identity is stripped before saving.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Messages Inbox:</strong> Dean, HOD, and Admin can view all anonymous messages with timestamps in a dedicated inbox page.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Auto Table Creation:</strong> Database tables are automatically created on server startup if they don&apos;t exist.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-600">
                                🔄 Changed
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-blue-500">
                                <li>
                                    <strong className="text-gray-900">API Proxy:</strong> All API requests now route through a Next.js rewrite proxy, eliminating CORS issues during local development.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Sidebar Navigation:</strong> Sidebar items are dynamically filtered based on user role and coordinator subtype instead of showing all items to all users.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Registration:</strong> The register endpoint now accepts an optional department field.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-600">
                                🐛 Fixed
                            </h3>
                            <ul className="list-inside list-disc space-y-2 text-gray-600 marker:text-gray-500">
                                <li>
                                    <strong className="text-gray-900">Auth Token Bug:</strong> Fixed localStorage key mismatch in Staff Management and Anonymous Messages — requests were sending null tokens causing 401 errors.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Build Error:</strong> Replaced date-fns dependency with native Intl.DateTimeFormat in Staff and Anonymous Messages pages.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Health Check 404:</strong> Added /health to the Next.js proxy rewrite rules so the backend health check is accessible.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Messages Access:</strong> Added Admin role to the anonymous messages viewer endpoint which was previously restricted to Dean and HOD only.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

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
                                    <strong className="text-gray-900">Vercel Deployment:</strong> Resolved the &ldquo;405 Method Not Allowed&rdquo; routing conflict for POST requests during production deployment.
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

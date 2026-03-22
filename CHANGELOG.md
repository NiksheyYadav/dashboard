# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-03-02

### Added (1.3.0)

- **Projects Module:** Complete project management system with CRUD operations and role-based access.
- **Project Flow System:** Typed flow classification with `"internal" | "external"` enum for explicit project type tracking.
- **Faculty Coordinator:** New field to designate the internal faculty managing project approvals and student enrollment.
- **Approval Tracking:** Added `approvalSubmittedBy` field to create an audit trail of who submitted projects for approval.
- **Project Form:** Interactive form with flow toggle buttons ("🏫 Internal" / "🌐 External") and conditional external faculty fields.
- **Project List View:** ProjectCard component displaying projects with automatic external collaboration detection and coordinator information.
- **Project Detail Modal:** Detailed project view with support for showing both coordinators and external faculty where applicable.
- **Student Assignment:** Interface to add and manage students assigned to projects with role-based permissions.
- **Projects REST API:** 10 REST endpoints for complete project lifecycle management (list, get, create, update, delete, approve, reject, add/remove students, complete).
- **Database Migration:** Alembic migration (20260302_0009) to update projects table schema with new fields and column renames.

### Changed (1.3.0)

- **Faculty Field Semantics:** Renamed `internalFaculty` to `facultyCoordinator` across frontend components and backend models for clarity on role responsibility.
- **Flow Representation:** Replaced boolean `isExternalCollaboration` flag with typed `ProjectFlow` enum for type-safe flow management.

### Technical Details (1.3.0)

- **Frontend Types:** Updated `src/lib/types/project.ts` with new `ProjectFlow` type and field structure.
- **Components Updated:** ProjectForm, ProjectCard, ProjectDetailModal now use new flow system and field names.
- **Backend Models:** SQLAlchemy Project model and Pydantic ProjectCreate schema updated with new columns and validation.
- **API Endpoints:** create_project endpoint auto-populates `faculty_coordinator` from authenticated user context.
- **Database Schema:** Added `flow`, renamed `internal_faculty` → `faculty_coordinator`, added `approval_submitted_by` columns.

## [1.2.0] - 2026-02-28

### Added (1.2.0)

- **Role-Based Access Control:** Full RBAC with Admin, Dean, HOD, Faculty, and Coordinator roles, each seeing only relevant navigation and pages.
- **Coordinator Subtypes:** Coordinators are auto-classified as Placement, Attendance, or Events based on email, with subtype-specific sidebar filtering.
- **Events Page:** Event Room Booking page where Faculty and Coordinators can book rooms; Dean and HOD have read-only access.
- **Anonymous Messaging:** Faculty and Coordinators can send fully untraceable anonymous feedback to the Dean; identities are stripped before saving.
- **Messages Inbox:** Dean, HOD, and Admin can view all anonymous messages with timestamps in a dedicated inbox.
- **Auto Table Creation:** Database tables are auto-created on server startup if they do not exist.

## [1.1.0] - 2026-02-27

### Added (1.1.0)

- **Feedback System:** Built a secure Anonymous Messages feature allowing faculties to send untraceable feedback directly to the Dean.
- **Password UX:** Added eye/eye-off toggle to show and hide passwords on the login screen.
- **Password UX:** Added Caps Lock detection with a warning indicator on the login form.
- **Forgot Password Flow:** Implemented complete email-based forgot password and reset password flow.
- **Students CRUD:** Created `students` database table and full CRUD API (Create, Read, Update, Delete) for managing SGT University students.
- **Student Directory:** Re-wired the Student Directory page to fetch real data from the database, featuring pagination, search, and filtering.
- **Add Student Dialog:** Activated the "Add New Student" form to save real records to the database.

### Changed (1.1.0)

- **Attendance Access:** Expanded access to the Attendance page from Coordinators-only to also include Deans and HODs.
- **Student Visibility:** Stopped showing employee accounts (Dean, HOD, etc.) in the Student Directory. It now exclusively shows real students.

### Removed (1.1.0)

- **Account Lock:** Removed the temporary account locking mechanism upon 5 failed login attempts to prevent user friction, keeping only the failed attempt counter for security logs.

### Fixed (1.1.0)

- **Vercel Deployment:** Fixed the "405 Method Not Allowed" error for POST requests by properly configuring `vercel.json` rewrites and exposing the FastAPI app via `api/index.py`.

## [1.0.0] - Initial Release

### Added (1.0.0)

- Boilerplate Next.js dashboard template with Tailwind CSS and Lucide React icons.
- FastAPI backend template with SQLAlchemy, Alembic, and PostgreSQL support.
- Initial User Auth structure (JWT tokens, login, active sessions).

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-27

### Added
- **Feedback System:** Built a secure Anonymous Messages feature allowing faculties to send untraceable feedback directly to the Dean.
- **Password UX:** Added eye/eye-off toggle to show and hide passwords on the login screen.
- **Password UX:** Added Caps Lock detection with a warning indicator on the login form.
- **Forgot Password Flow:** Implemented complete email-based forgot password and reset password flow.
- **Students CRUD:** Created `students` database table and full CRUD API (Create, Read, Update, Delete) for managing SGT University students.
- **Student Directory:** Re-wired the Student Directory page to fetch real data from the database, featuring pagination, search, and filtering.
- **Add Student Dialog:** Activated the "Add New Student" form to save real records to the database.

### Changed
- **Attendance Access:** Expanded access to the Attendance page from Coordinators-only to also include Deans and HODs.
- **Student Visibility:** Stopped showing employee accounts (Dean, HOD, etc.) in the Student Directory. It now exclusively shows real students.

### Removed
- **Account Lock:** Removed the temporary account locking mechanism upon 5 failed login attempts to prevent user friction, keeping only the failed attempt counter for security logs.

### Fixed
- **Vercel Deployment:** Fixed the "405 Method Not Allowed" error for POST requests by properly configuring `vercel.json` rewrites and exposing the FastAPI app via `api/index.py`.

## [1.0.0] - Initial Release

### Added
- Boilerplate Next.js dashboard template with Tailwind CSS and Lucide React icons.
- FastAPI backend template with SQLAlchemy, Alembic, and PostgreSQL support.
- Initial User Auth structure (JWT tokens, login, active sessions).

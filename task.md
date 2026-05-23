# SOET App Implementation — Task Tracker

## Phase 0: Foundation — Data Model & Auth Overhaul
- [x] Backend enums (UserRoleEnum, AttendanceStatusEnum, ClassTypeEnum, etc.)
- [x] New database models (20 entities)
- [x] Modify User model (add roles, name, phone, etc.)
- [x] Modify Student model (add section_id, programme_id, mentor_id, parent fields)
- [x] Alembic migration for all new tables
- [x] Update auth-context.tsx (server-provided roles, multi-role support)
- [ ] Update auth backend to return roles in /auth/me

## UI Overhaul — Navy Sidebar + SGT Branding
- [x] Sidebar redesign (navy background, SGT logo, new nav items)
- [x] Topbar update (notification bell, page title)
- [x] globals.css SOET design tokens (badge classes, stat cards, color palette)
- [x] Update navigation constants for SOET modules
- [x] Role migration: coordinator → activity_coordinator, faculty → teacher
- [x] Login page updated with new roles
- [x] All RequireRole gates updated across pages

## Frontend Pages — Created with Mock Data
- [x] Subject Attendance page (mark attendance, subject selector, slot picker)
- [x] Mentee Monitor page (student risk cards, counselling, warnings)
- [x] Leave & Arrangement page (leave form, workflow stepper, arrangement table)
- [x] Extra Classes page (scheduled/conducted classes table with filters)
- [x] Activity Attendance page (activity list, approval workflow, proof upload)
- [x] Reports page (8 report types, filter bar, export actions)
- [x] Build verification — fixing TypeScript errors

## Phase 1: Coordinator Template Import System
- [x] Academic data API module (router, service, schemas)
- [x] PDF/Excel parser engine
- [x] Template generator (downloadable .xlsx)
- [x] Import validation engine (clash detection, duplicates)
- [x] Import preview + commit + rollback endpoints
- [x] Academic Data Management UI page

## Phase 2: Subject Attendance Module — Backend
- [ ] Attendance API module (mark, history, summary)
- [ ] Attendance engine (shared calculation model)
- [ ] Connect Subject Attendance UI to API

## Phase 3: Mentor Module — Backend
- [ ] Mentor API module
- [ ] Counselling notes, parent communication, regularization endpoints
- [ ] Connect Mentee Monitor UI to API

## Phase 4: Leave & Arrangement + Extra Classes — Backend
- [ ] Leave API module
- [ ] Extra Class API module
- [ ] Connect Leave & Arrangement UI to API
- [ ] Connect Extra Classes UI to API

## Phase 5: HoD & Dean Monitoring Dashboards
- [ ] Monitoring API module
- [ ] HoD Dashboard component
- [ ] Dean Dashboard component (matching mockup)
- [ ] Role-based dashboard routing

## Phase 6: Reporting & Exports
- [ ] Reports API module (Excel/PDF generation)
- [ ] Connect Reports UI to API

## Phase 7: Activity Attendance & Notifications
- [ ] Activity Attendance API
- [ ] Notification engine + bell component
- [ ] Audit log integration

# Backend From Scratch Blueprint (Phase 1)

**Project:** Student Attendance & Activity Tracking System  
**Scope:** Phase 1 only = Authentication + Dashboard Core  
**Date:** 2026-02-25

---

## 0) What this document is for

Use this as the backend foundation spec to implement from zero ambiguity for Phase 1.

This document includes:
- exact backend responsibilities
- required data model and constraints
- auth/session design
- role and permission model
- API contracts (request/response/error)
- frontend-consumed data needs from the current project
- validation/business rules
- edge cases + security + scaling requirements
- recommended build order

---

## 1) Phase 1 Scope Boundary

### In scope
- user authentication and session handling
- role-based access control (RBAC)
- dashboard core metrics for role-based users
- core student/attendance/event status read models needed by dashboard
- secure API contracts for frontend integration
- audit logging for sensitive actions

### Out of scope for Phase 1 (defer)
- full event lifecycle management workflows
- full fees/forms/reporting modules
- advanced analytics forecasting
- multi-tenant org self-service admin portal
- MFA UX flows (backend hooks can be prepared)

---

## 2) Runtime and Service Architecture

## 2.1 Recommended stack
- **API framework:** FastAPI
- **DB:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Cache:** Redis (recommended for dashboard summary caching + rate limits)
- **Background jobs:** Celery/RQ/APScheduler (for cleanup, aggregates, audit retention)

## 2.2 API base conventions
- base path: `/api/v1`
- JSON content type for all non-file endpoints
- UTC timestamps everywhere (`TIMESTAMPTZ`)
- UUID primary keys for all major entities

## 2.3 Service boundaries (Phase 1)
- **Auth Service Layer**: login, token issuance/rotation, logout, lockout checks
- **Identity/RBAC Layer**: principal resolution, permissions, scope checks
- **Dashboard Query Layer**: role-scoped aggregates and trend data
- **Audit Layer**: append-only security and domain action logs

---

## 3) User Roles and Access Model

## 3.1 Canonical roles
1. `STUDENT`
2. `EVENT_COORDINATOR`
3. `FACULTY`
4. `DEPARTMENT_ADMIN`
5. `ADMIN`
6. `SUPER_ADMIN`

## 3.2 Minimum active Phase 1 roles
- `STUDENT`
- `FACULTY`
- `EVENT_COORDINATOR`
- `ADMIN`
- `SUPER_ADMIN`

(You may map `DEPARTMENT_ADMIN` to `ADMIN` temporarily if needed.)

## 3.3 Permission model
Use RBAC with permission strings and scope checks.

Examples:
- `auth.login`
- `dashboard.student.read`
- `dashboard.department.read`
- `dashboard.global.read`
- `attendance.read.self`
- `attendance.read.department`
- `attendance.mark.event`
- `role.assign`
- `user.manage`

## 3.4 Scope model
- `SELF`
- `DEPARTMENT`
- `EVENT`
- `GLOBAL`

Authorization decision = **permission + scope**.

## 3.5 Role-to-dashboard visibility
- **Student**: only own attendance, own event participation, own campus status
- **Event Coordinator**: assigned event metrics and participant summaries
- **Faculty**: department/class aggregates and at-risk lists (scoped)
- **Admin**: organization-level operational dashboard
- **Super Admin**: all admin metrics + security/session health

---

## 4) Database Schema Requirements (Phase 1)

## 4.1 Core design rules
- All business tables include `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (soft delete)
- Immutable audit table (`audit_logs`) is append-only
- Unique constraints and composite indexes must match query patterns
- All timestamps in UTC

---

## 4.2 Entity list (required)

### A) Identity and Access

### `users`
- `id UUID PK`
- `email VARCHAR(254) NOT NULL UNIQUE`
- `phone VARCHAR(20) NULL`
- `password_hash TEXT NOT NULL`
- `status user_status NOT NULL`
- `failed_login_count INT NOT NULL DEFAULT 0`
- `locked_until TIMESTAMPTZ NULL`
- `last_login_at TIMESTAMPTZ NULL`
- `is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE`
- audit fields

**Indexes**
- unique `email`
- index `status`
- index `last_login_at`

### `roles`
- `id UUID PK`
- `code role_code NOT NULL UNIQUE`
- `name VARCHAR(80) NOT NULL UNIQUE`
- `is_system BOOLEAN NOT NULL DEFAULT TRUE`
- audit fields

### `permissions`
- `id UUID PK`
- `code VARCHAR(120) NOT NULL UNIQUE`
- `resource VARCHAR(60) NOT NULL`
- `action VARCHAR(40) NOT NULL`
- audit fields

**Indexes**
- index `(resource, action)`

### `role_permissions`
- `role_id UUID FK roles(id)`
- `permission_id UUID FK permissions(id)`
- `created_at`, `created_by`

**Constraints**
- PK/unique `(role_id, permission_id)`

### `user_roles`
- `user_id UUID FK users(id)`
- `role_id UUID FK roles(id)`
- `scope_type scope_type NOT NULL`
- `scope_id UUID NULL`
- `is_primary BOOLEAN NOT NULL DEFAULT FALSE`
- audit fields

**Constraints/Indexes**
- unique `(user_id, role_id, scope_type, scope_id)`
- index `user_id`
- index `role_id`
- index `(scope_type, scope_id)`

### `sessions`
- `id UUID PK`
- `user_id UUID FK users(id) NOT NULL`
- `device_fingerprint VARCHAR(255) NULL`
- `ip INET NOT NULL`
- `user_agent TEXT NOT NULL`
- `started_at TIMESTAMPTZ NOT NULL`
- `last_seen_at TIMESTAMPTZ NOT NULL`
- `revoked_at TIMESTAMPTZ NULL`
- audit fields

**Indexes**
- index `user_id`
- index `last_seen_at`
- index `revoked_at`

### `refresh_tokens`
- `id UUID PK`
- `session_id UUID FK sessions(id) NOT NULL`
- `user_id UUID FK users(id) NOT NULL`
- `token_hash TEXT NOT NULL UNIQUE`
- `expires_at TIMESTAMPTZ NOT NULL`
- `rotated_from UUID NULL` (self-ref)
- `revoked_at TIMESTAMPTZ NULL`
- audit fields

**Indexes**
- index `user_id`
- index `session_id`
- index `expires_at`
- index `revoked_at`

### `audit_logs` (append only)
- `id BIGSERIAL PK`
- `actor_user_id UUID NULL FK users(id)`
- `action VARCHAR(120) NOT NULL`
- `entity_type VARCHAR(80) NOT NULL`
- `entity_id UUID NULL`
- `before JSONB NULL`
- `after JSONB NULL`
- `ip INET NULL`
- `request_id UUID NOT NULL`
- `occurred_at TIMESTAMPTZ NOT NULL`

**Indexes**
- index `actor_user_id`
- index `(entity_type, entity_id)`
- index `occurred_at`
- index `request_id`

---

### B) Academic and People Core

### `departments`
- `id UUID PK`
- `code VARCHAR(20) NOT NULL UNIQUE`
- `name VARCHAR(120) NOT NULL UNIQUE`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- audit fields

### `academic_years`
- `id UUID PK`
- `label VARCHAR(20) NOT NULL UNIQUE`
- `start_date DATE NOT NULL`
- `end_date DATE NOT NULL`
- `is_current BOOLEAN NOT NULL DEFAULT FALSE`
- audit fields

**Constraints**
- check `start_date < end_date`
- partial unique index on `is_current = TRUE`

### `student_profiles`
- `user_id UUID PK FK users(id)`
- `student_number VARCHAR(30) NOT NULL UNIQUE`
- `department_id UUID FK departments(id) NOT NULL`
- `academic_year_id UUID FK academic_years(id) NOT NULL`
- `program VARCHAR(120) NOT NULL`
- `section VARCHAR(20) NULL`
- `enrollment_status enrollment_status NOT NULL`
- audit fields

**Indexes**
- index `department_id`
- index `academic_year_id`
- index `enrollment_status`

### `faculty_profiles`
- `user_id UUID PK FK users(id)`
- `employee_code VARCHAR(30) NOT NULL UNIQUE`
- `department_id UUID FK departments(id) NOT NULL`
- `designation VARCHAR(80) NULL`
- audit fields

---

### C) Attendance, Events, Location Status

### `attendance_records`
- `id UUID PK`
- `student_user_id UUID FK users(id) NOT NULL`
- `attendance_date DATE NOT NULL`
- `slot VARCHAR(20) NULL`
- `status attendance_status NOT NULL`
- `source attendance_source NOT NULL`
- `marked_by UUID FK users(id) NULL`
- `reason TEXT NULL`
- audit fields

**Constraints/Indexes**
- unique `(student_user_id, attendance_date, slot)`
- index `(attendance_date, status)`
- index `student_user_id`

### `events`
- `id UUID PK`
- `title VARCHAR(200) NOT NULL`
- `category event_type NOT NULL`
- `department_id UUID FK departments(id) NULL`
- `coordinator_user_id UUID FK users(id) NOT NULL`
- `start_at TIMESTAMPTZ NOT NULL`
- `end_at TIMESTAMPTZ NOT NULL`
- `location VARCHAR(200) NULL`
- `is_approved BOOLEAN NOT NULL DEFAULT FALSE`
- audit fields

**Constraints/Indexes**
- check `end_at > start_at`
- index `start_at`
- index `department_id`
- index `coordinator_user_id`
- index `is_approved`

### `event_participations`
- `id UUID PK`
- `event_id UUID FK events(id) NOT NULL`
- `student_user_id UUID FK users(id) NOT NULL`
- `role participation_role NOT NULL`
- `participation_status participation_status NOT NULL`
- `check_in_at TIMESTAMPTZ NULL`
- audit fields

**Constraints/Indexes**
- unique `(event_id, student_user_id)`
- index `event_id`
- index `student_user_id`
- index `participation_status`

### `location_status_history`
- `id UUID PK`
- `student_user_id UUID FK users(id) NOT NULL`
- `campus_status campus_status NOT NULL`
- `effective_from TIMESTAMPTZ NOT NULL`
- `effective_to TIMESTAMPTZ NULL`
- `source status_source NOT NULL`
- `approved_by UUID FK users(id) NULL`
- audit fields

**Constraints/Indexes**
- index `(student_user_id, effective_from DESC)`
- index `campus_status`
- partial index where `effective_to IS NULL`
- enforce no overlapping active intervals per student

---

## 4.3 Soft delete policy
- Soft delete required for:
  - users
  - profiles
  - attendance records
  - events
  - event participations
- Hard delete allowed only for:
  - expired/revoked refresh tokens
  - stale sessions (cleanup policy)

---

## 5) Authentication and Session Design

## 5.1 Auth strategy
Use **short-lived access JWT + rotating refresh token**.

## 5.2 Token claims (access)
- `sub` (user id)
- `sid` (session id)
- `roles` (resolved effective roles)
- `scope` (or scope claims by role)
- `jti` (token id)
- `iat`, `exp`, `iss`, `aud`

## 5.3 Token storage
- Access token in HttpOnly, Secure, SameSite cookie (web)
- Refresh token in separate HttpOnly, Secure, SameSite cookie
- Store **hash** of refresh token in DB, never raw token

## 5.4 Refresh rotation and replay handling
- On refresh, issue new refresh token and revoke old one
- Keep chain via `rotated_from`
- If old token reused -> revoke whole session chain and force re-login

## 5.5 Password storage
- Argon2id preferred (or bcrypt >= cost 12)
- include pepper from environment

## 5.6 Session policy
- access token TTL: 10 to 15 minutes
- refresh token TTL: 7 to 30 days
- inactivity timeout for sessions (for example 7 days)
- immediate invalidation on:
  - password change
  - account lock/suspend
  - privilege downgrade

## 5.7 Login flow
1. validate credentials
2. validate user status and lock status
3. create session row
4. create access token + refresh token
5. persist refresh token hash
6. return principal payload

## 5.8 Logout flow
- `/auth/logout` revokes current session and refresh token
- optional `allDevices=true` revokes all user sessions

---

## 6) Route Protection and RBAC Enforcement

## 6.1 Middleware sequence
1. request id middleware
2. auth extraction middleware
3. principal loader
4. permission+scope authorization
5. audit logger

## 6.2 Non-negotiable rules
- Never rely on frontend nav visibility for security
- Every protected endpoint enforces backend permission check
- Scope checks must be applied at query level (where clause), not only controller level

## 6.3 Role conflict resolution
When users have multiple roles:
- union of permissions
- most restrictive scope for sensitive actions unless explicitly global
- deny by default on ambiguity

---

## 7) Dashboard Data Requirements (Phase 1)

## 7.1 Student dashboard
Needs:
- attendance percentage
- classes present/absent/late/excused counts
- current campus status
- upcoming approved events

Queries:
- attendance aggregate by student and date range
- latest active location status
- event participation joins for upcoming events

## 7.2 Coordinator dashboard
Needs:
- assigned events count
- participant totals per event
- check-in rates

Queries:
- filter events by coordinator_id and date range
- group event_participations by status per event

## 7.3 Faculty dashboard
Needs:
- department attendance average
- at-risk students under threshold
- department participation overview

Queries:
- students + attendance grouped by department/program/semester
- threshold filter (< 75% etc)

## 7.4 Admin dashboard
Needs:
- total active students
- outside-campus currently
- org attendance trend
- event participation totals

Queries:
- org-level aggregate counts
- current status active row count (`effective_to IS NULL` + status)
- weekly trend aggregation

## 7.5 Super admin dashboard
Needs admin dashboard + security signals:
- active sessions
- failed login trends
- lockout count

---

## 8) Production API Contracts

## 8.1 Response envelope
### Success
```json
{
  "success": true,
  "data": {},
  "meta": {},
  "requestId": "uuid"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {}
  },
  "requestId": "uuid"
}
```

## 8.2 Auth endpoints

### `POST /api/v1/auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "******",
  "deviceInfo": {
    "name": "Chrome on Windows"
  }
}
```

Response data:
```json
{
  "user": {
    "id": "uuid",
    "fullName": "Dr. Priya Mehta",
    "email": "hod.cs@...",
    "status": "ACTIVE"
  },
  "roles": ["FACULTY"],
  "scopes": [{ "type": "DEPARTMENT", "id": "uuid" }],
  "sessionId": "uuid",
  "accessTokenExpiresIn": 900
}
```

Errors:
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_ACCOUNT_LOCKED`
- `AUTH_ACCOUNT_INACTIVE`

### `POST /api/v1/auth/refresh`
- uses refresh cookie
- rotates token

### `POST /api/v1/auth/logout`
Request:
```json
{ "allDevices": false }
```

### `GET /api/v1/auth/me`
Returns principal profile + effective permissions/scopes.

---

## 8.3 Dashboard endpoints (Phase 1)

### `GET /api/v1/dashboard/student?from=YYYY-MM-DD&to=YYYY-MM-DD`
Auth: `STUDENT`

Data:
```json
{
  "attendanceSummary": {
    "percentage": 92.4,
    "present": 142,
    "absent": 8,
    "late": 3,
    "excused": 1
  },
  "campusStatus": "INSIDE",
  "upcomingEvents": [
    {
      "eventId": "uuid",
      "title": "Hackathon",
      "startAt": "2026-03-01T10:00:00Z"
    }
  ]
}
```

### `GET /api/v1/dashboard/coordinator?from=&to=&eventId=`
Auth: `EVENT_COORDINATOR`

### `GET /api/v1/dashboard/faculty?from=&to=&departmentId=&academicYearId=`
Auth: `FACULTY|DEPARTMENT_ADMIN`

### `GET /api/v1/dashboard/admin?from=&to=&departmentId=`
Auth: `ADMIN`

### `GET /api/v1/dashboard/super-admin?from=&to=`
Auth: `SUPER_ADMIN`

---

## 8.4 Frontend compatibility map from current project

Current frontend files indicate these data needs and naming expectations:
- teacher dashboard currently uses summary + top performers + weekly trend + distribution + student page slice
- if backend keeps different route names, add adapter layer on frontend API client

**Known route mismatches to resolve intentionally:**
1. frontend intention: `/analytics/summary`; backend currently has `/analytics/overview`
2. frontend intention: `/attendance/bulk-upload`; backend currently has `/attendance/upload-csv`
3. frontend intention: `/cv/upload?studentId=`; backend currently has `/cv/upload/{student_id}`
4. frontend student list expects paginated envelope; backend list route should provide pagination contract

Pick one convention and align both sides fully before coding dashboard integration.

---

## 9) Backend State Variables and Enums

## 9.1 Environment variables
- `APP_ENV`
- `APP_NAME`
- `API_V1_PREFIX`
- `DATABASE_URL`
- `DATABASE_POOL_MIN`
- `DATABASE_POOL_MAX`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ALGORITHM`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `ACCESS_TOKEN_TTL_MINUTES`
- `REFRESH_TOKEN_TTL_DAYS`
- `SESSION_IDLE_TIMEOUT_MINUTES`
- `SESSION_MAX_LIFETIME_DAYS`
- `PASSWORD_PEPPER`
- `ARGON2_TIME_COST`
- `ARGON2_MEMORY_COST`
- `ARGON2_PARALLELISM`
- `RATE_LIMIT_LOGIN_PER_MIN`
- `RATE_LIMIT_API_PER_MIN`
- `CORS_ALLOWED_ORIGINS`
- `COOKIE_DOMAIN`
- `COOKIE_SECURE`
- `AUDIT_LOG_RETENTION_DAYS`
- `REFRESH_TOKEN_RETENTION_DAYS`

## 9.2 Enum definitions

### `role_code`
- `STUDENT`
- `EVENT_COORDINATOR`
- `FACULTY`
- `DEPARTMENT_ADMIN`
- `ADMIN`
- `SUPER_ADMIN`

### `user_status`
- `PENDING_VERIFICATION`
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
- `LOCKED`
- `DELETED`

### `attendance_status`
- `PRESENT`
- `ABSENT`
- `LATE`
- `EXCUSED`

### `attendance_source`
- `MANUAL`
- `EVENT_AUTO`
- `SYSTEM_IMPORT`

### `campus_status`
- `INSIDE`
- `OUTSIDE`
- `ON_APPROVED_EVENT`
- `UNKNOWN`

### `event_type`
- `ACADEMIC`
- `CULTURAL`
- `SPORTS`
- `PLACEMENT`
- `WORKSHOP`
- `OTHER`

### `participation_role`
- `ATTENDEE`
- `VOLUNTEER`
- `ORGANIZER`
- `SPEAKER`

### `participation_status`
- `REGISTERED`
- `CHECKED_IN`
- `NO_SHOW`
- `CANCELLED`

### `scope_type`
- `SELF`
- `DEPARTMENT`
- `EVENT`
- `GLOBAL`

### `enrollment_status`
- `ENROLLED`
- `ON_LEAVE`
- `GRADUATED`
- `DROPPED`

### `status_source`
- `STUDENT_UPDATE`
- `FACULTY_OVERRIDE`
- `SYSTEM_SYNC`

---

## 10) Validation and Business Rules

## 10.1 Input validation
- strict schema validation for every endpoint
- reject unknown fields for sensitive endpoints
- normalize emails to lowercase

## 10.2 Identity rules
- email must be unique
- password policy minimum complexity
- optional password breached-list check

## 10.3 Attendance rules
- no duplicate attendance per student/date/slot
- cannot mark attendance for non-enrolled students
- `PRESENT` while campus status `OUTSIDE` is invalid unless linked approved event participation

## 10.4 Event rules
- event end must be after start
- only authorized coordinators/faculty/admin can manage event participation

## 10.5 Location rules
- only one active campus status per student
- no overlapping status intervals

## 10.6 Cross-entity constraints
- faculty operations must match scope department
- soft-deleted users cannot authenticate or be assigned new records

## 10.7 Temporal rules
- `from <= to`
- max query window cap for expensive aggregates (for example 180 days)

---

## 11) Edge Cases to Handle in Phase 1

## 11.1 Authentication edge cases
- refresh token replay
- simultaneous refresh requests race
- stale token after password reset
- lockout window and backoff handling

## 11.2 Role edge cases
- multi-role user with conflicting scopes
- user role downgraded during active session
- coordinator also student (must not gain unrelated student visibility)

## 11.3 Dashboard consistency edge cases
- missing attendance days in selected range
- delayed location status updates
- null department on records created before department assignment

## 11.4 Concurrency edge cases
- duplicate writes for same attendance slot
- concurrent active campus status rows

## 11.5 Deletion edge cases
- references to soft-deleted entities in aggregates
- token cleanup job deleting needed forensic records too early

---

## 12) Security Requirements

## 12.1 API hardening
- request body size limits
- strict content type checks
- centralized exception handling

## 12.2 Injection prevention
- ORM parameterized queries
- no dynamic SQL without parameter binding

## 12.3 Abuse prevention
- per-IP and per-account login rate limiting
- progressive delay on repeated failures
- account lock thresholds with audit trail

## 12.4 Access control
- enforce permissions in backend service layer
- enforce row-level scope in queries

## 12.5 Sensitive data protection
- hash passwords and refresh tokens
- encrypt high-risk PII fields if required by policy
- mask sensitive values in logs

## 12.6 Audit and monitoring
- log auth success/failure, role changes, attendance edits
- immutable audit storage policy
- alert on suspicious auth patterns

---

## 13) Performance and Scale (10k+ students)

## 13.1 Query performance
- composite indexes for high-frequency filters
- cover dashboard group-by columns
- avoid N+1 query patterns

## 13.2 Caching strategy
- cache dashboard summaries 30 to 120 seconds by role+scope+filter hash
- invalidate on key domain writes where needed

## 13.3 Aggregation strategy
- optional daily aggregate table/materialized view for org-level dashboard
- incremental refresh job nightly or hourly

## 13.4 Pagination and limits
- all list endpoints must paginate
- enforce maximum page size

---

## 14) Observability and Operability

## 14.1 Structured logging
- include `request_id`, `user_id`, `session_id`, `route`, latency, status code

## 14.2 Metrics
- login success/failure counts
- active sessions
- token refresh rate
- dashboard endpoint latency p95/p99
- DB query latency

## 14.3 Tracing
- endpoint trace IDs through DB and cache layers

## 14.4 Scheduled jobs
- revoke/cleanup expired refresh tokens
- session cleanup
- data integrity checks (duplicate active statuses etc.)

---

## 15) Build Order (Recommended)

1. **Base infra**: config, DB connection, migrations scaffolding, request-id middleware
2. **Identity schema**: users, roles, permissions, user_roles
3. **Auth core**: login, me, refresh, logout, session and refresh token tables
4. **RBAC middleware**: permission and scope enforcement utilities
5. **Academic core schema**: departments, academic_years, profiles
6. **Attendance/event/location schema**
7. **Dashboard query services** per role
8. **Dashboard endpoints** + response DTOs
9. **Audit logging hooks**
10. **Rate limits and security hardening**
11. **Cache layer for dashboard**
12. **E2E contract tests for auth + dashboard**

---

## 16) Definition of Done for Phase 1

Phase 1 is done only if all are true:
- login/me/refresh/logout fully functional with rotation and revocation
- all protected endpoints enforce permission + scope server-side
- role dashboards return production data, not mocks
- student list and dashboard responses match agreed frontend contracts
- all core constraints and indexes exist in DB migrations
- audit logs captured for auth and critical changes
- rate limiting and brute force controls active
- basic performance targets met at expected load

---

## 17) Immediate Next Step (Practical)

Before coding, freeze one contract map table:
- each frontend API function -> final backend route/method
- request schema
- response schema
- authorization required
- field naming (snake_case vs camelCase) transformation policy

That prevents 80% of integration churn.

---

If you want, next I can generate a second markdown named `PHASE1_MIGRATION_AND_ENDPOINT_TASKLIST.md` with ticket-ready tasks (DB migration tickets, endpoint tickets, and test cases) in execution order.

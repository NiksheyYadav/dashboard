# EduPulse Backend Integration Guide

> **For**: Backend developers building the REST API for the EduPulse Student Dashboard  
> **Frontend**: Next.js 14 · TypeScript · Recharts · shadcn/ui  
> **Date**: February 2026  

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Architecture Overview](#2-architecture-overview)
3. [Environment Configuration](#3-environment-configuration)
4. [API Endpoints Reference](#4-api-endpoints-reference)
5. [Data Models (TypeScript Contracts)](#5-data-models-typescript-contracts)
6. [Response Envelope Formats](#6-response-envelope-formats)
7. [Endpoint Details & Example Responses](#7-endpoint-details--example-responses)
8. [Authentication](#8-authentication)
9. [File Upload (CV)](#9-file-upload-cv)
10. [Error Handling](#10-error-handling)
11. [CORS Configuration](#11-cors-configuration)
12. [Frontend Integration Steps](#12-frontend-integration-steps)
13. [Data Conventions](#13-data-conventions)
14. [Database Schema Suggestion](#14-database-schema-suggestion)

---

## 1. Quick Start

The frontend is currently running on **mock data** defined in `src/lib/data/mock-data.ts`. The API functions in `src/lib/api/*.ts` are the **only files** that need to change when the backend is ready.

**What you need to provide:**
- A REST API server (Node.js/Express, Django, Spring Boot, etc.)
- Endpoints matching the contracts below
- JWT-based authentication
- `multipart/form-data` file upload support for CVs

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
│                                                      │
│  Components ──▶ lib/api/*.ts ──▶ Your Backend API    │
│                     │                                │
│              (only these files change)               │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│                 YOUR BACKEND SERVER                  │
│                                                      │
│  • REST API endpoints                                │
│  • JWT authentication                                │
│  • Database (PostgreSQL/MongoDB/MySQL)               │
│  • File storage (local/S3) for CVs                   │
└──────────────────────────────────────────────────────┘
```

**Frontend API layer files to update:**

| File | Purpose |
|---|---|
| `src/lib/api/students.ts` | Student CRUD, CV upload, report export |
| `src/lib/api/attendance.ts` | Top performers, weekly trend, distribution |
| `src/lib/api/analytics.ts` | Dashboard summary statistics |

---

## 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Your backend server URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=https://api.sgtuniversity.edu/eblock

# NextAuth (if using frontend auth)
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

The frontend reads `NEXT_PUBLIC_API_BASE_URL` and prefixes all API calls with it. If not set, it defaults to `/api` (Next.js internal routes).

---

## 4. API Endpoints Reference

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/students` | Paginated student list with filters |
| `GET` | `/students/:id` | Single student profile |
| `POST` | `/students` | Create a new student |
| `PUT` | `/students/:id` | Update student information |
| `DELETE` | `/students/:id` | Remove a student |
| `GET` | `/students/export` | Download student report (CSV/PDF) |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/attendance?type=top&semester=current` | Top-performing students |
| `GET` | `/attendance?type=weekly` | Weekly trend (W1–W5) |
| `GET` | `/attendance/summary` | Overall distribution (present/absent/leave) |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/summary` | Dashboard stat card data |

### CV Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cv/upload` | Upload student CV (multipart/form-data) |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Faculty login (returns JWT) |
| `POST` | `/auth/logout` | Invalidate session |
| `GET` | `/auth/me` | Get current user profile |

---

## 5. Data Models (TypeScript Contracts)

These are the **exact interfaces** the frontend expects. Your API responses must match these shapes.

### Student

```typescript
type CVStatus = "UPLOADED" | "PENDING" | "REJECTED";

interface Student {
  id: string;             // Unique identifier
  name: string;           // Full name, e.g. "Alice Williams"
  rollNo: string;         // Format: "CS-2024-001" (Dept-Year-Serial)
  course: string;         // e.g. "B.Tech CS", "B.Tech IT"
  avatarUrl?: string;     // Optional URL to profile image
  cvStatus: CVStatus;     // One of: "UPLOADED" | "PENDING" | "REJECTED"
  attendancePercent: number; // 0–100
  semester: number;       // 1–8
  email?: string;         // Optional
  phone?: string;         // Optional
}
```

### Top Performer

```typescript
interface TopPerformerData {
  name: string;           // Shortened format: "ALICE W."
  attendance: number;     // Percentage 0–100
}
```

### Weekly Trend

```typescript
interface WeeklyTrendData {
  week: string;           // "W1", "W2", "W3", "W4", "W5"
  attendance: number;     // Percentage 0–100
}
```

### Attendance Distribution

```typescript
interface DistributionData {
  present: number;        // Percentage, e.g. 82
  absent: number;         // Percentage, e.g. 12
  leave: number;          // Percentage, e.g. 6
  // Must sum to 100
}
```

### Dashboard Stats

```typescript
interface DashboardStats {
  totalStudents: number;       // e.g. 1248
  totalStudentsTrend: number;  // Percentage change, e.g. 4.2 or -1.5
  cvsUploaded: number;         // e.g. 856
  cvsUploadedLabel: string;    // e.g. "This month"
  avgAttendance: number;       // e.g. 92.4
  avgAttendanceTrend: number;  // Percentage change, e.g. -1.2
  lowAttendance: number;       // Count of students below threshold, e.g. 24
}
```

---

## 6. Response Envelope Formats

### Paginated List Response

Used by `GET /students`:

```json
{
  "data": [
    {
      "id": "1",
      "name": "Alice Williams",
      "rollNo": "CS-2024-001",
      "course": "B.Tech CS",
      "avatarUrl": null,
      "cvStatus": "UPLOADED",
      "attendancePercent": 96,
      "semester": 4
    }
  ],
  "total": 1248,
  "page": 1,
  "limit": 10
}
```

### Single Object Response

Used by `GET /students/:id`, `GET /analytics/summary`:

```json
{
  "data": { ... },
  "success": true,
  "message": "Student retrieved successfully"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Student not found",
  "error": "NOT_FOUND"
}
```

---

## 7. Endpoint Details & Example Responses

### GET /students

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number (1-indexed) |
| `limit` | number | `10` | Items per page |
| `course` | string | `"all"` | Filter by course slug (e.g. `"btech-cs"`) |
| `semester` | number | — | Filter by semester (1–8) |
| `search` | string | — | Search by name, roll number, or course |

**Response:**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Alice Williams",
      "rollNo": "CS-2024-001",
      "course": "B.Tech CS",
      "avatarUrl": null,
      "cvStatus": "UPLOADED",
      "attendancePercent": 96,
      "semester": 4
    },
    {
      "id": "2",
      "name": "Robert Maxwell",
      "rollNo": "CS-2024-002",
      "course": "B.Tech CS",
      "avatarUrl": null,
      "cvStatus": "PENDING",
      "attendancePercent": 89,
      "semester": 4
    }
  ],
  "total": 1248,
  "page": 1,
  "limit": 10
}
```

---

### GET /students/:id

**Response:**

```json
{
  "data": {
    "id": "1",
    "name": "Alice Williams",
    "rollNo": "CS-2024-001",
    "course": "B.Tech CS",
    "avatarUrl": null,
    "cvStatus": "UPLOADED",
    "attendancePercent": 96,
    "semester": 4,
    "email": "alice.williams@sgtuniversity.edu",
    "phone": "+91-9876543210"
  },
  "success": true
}
```

---

### POST /students

**Request Body:**

```json
{
  "name": "New Student",
  "rollNo": "CS-2024-010",
  "course": "B.Tech CS",
  "semester": 4,
  "email": "new.student@sgtuniversity.edu"
}
```

**Response:** `201 Created` with the created Student object.

---

### GET /students/export

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `course` | string | `"all"` | Filter by course |
| `semester` | number | — | Filter by semester |
| `format` | string | `"csv"` | `"csv"` or `"pdf"` |

**Response:** Binary file download with appropriate `Content-Type` header:
- CSV: `text/csv`
- PDF: `application/pdf`

Set `Content-Disposition: attachment; filename="student-report-2026-02-17.csv"`

---

### GET /attendance?type=top&semester=current

**Response:**

```json
[
  { "name": "ALICE W.", "attendance": 96 },
  { "name": "BOB M.", "attendance": 92 },
  { "name": "CHARLIE D.", "attendance": 94 },
  { "name": "DIANA R.", "attendance": 91 },
  { "name": "ETHAN K.", "attendance": 85 },
  { "name": "FIONA S.", "attendance": 78 },
  { "name": "GEORGE B.", "attendance": 88 }
]
```

> **Note:** Return 5–10 students sorted by attendance descending. `name` should be in shortened format: `"FIRSTNAME LASTINITIAL."`.

---

### GET /attendance?type=weekly

**Response:**

```json
[
  { "week": "W1", "attendance": 88 },
  { "week": "W2", "attendance": 82 },
  { "week": "W3", "attendance": 90 },
  { "week": "W4", "attendance": 75 },
  { "week": "W5", "attendance": 93 }
]
```

> Return exactly 5 weeks of data. `week` should be `"W1"` through `"W5"`.

---

### GET /attendance/summary

**Response:**

```json
{
  "present": 82,
  "absent": 12,
  "leave": 6
}
```

> Values must sum to 100 (percentages).

---

### GET /analytics/summary

**Response:**

```json
{
  "totalStudents": 1248,
  "totalStudentsTrend": 4.2,
  "cvsUploaded": 856,
  "cvsUploadedLabel": "This month",
  "avgAttendance": 92.4,
  "avgAttendanceTrend": -1.2,
  "lowAttendance": 24
}
```

> `totalStudentsTrend` and `avgAttendanceTrend` are percentage changes. Positive = growth, negative = decline.

---

### POST /cv/upload

**Request:**
- `Content-Type: multipart/form-data`
- Query param: `studentId` (string)
- Form field: `file` (PDF, max 5MB)

**Response (Success):**

```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "cvUrl": "https://storage.sgtuniversity.edu/cvs/CS-2024-001.pdf",
    "uploadedAt": "2026-02-17T16:30:00Z"
  }
}
```

**Validation Rules:**
- File type: PDF only (`application/pdf`)
- Max file size: 5 MB
- Student must exist in the database

---

### POST /auth/login

**Request Body:**

```json
{
  "email": "dr.smith@sgtuniversity.edu",
  "password": "securepassword123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "faculty-1",
      "name": "Dr. Smith",
      "email": "dr.smith@sgtuniversity.edu",
      "department": "CS Department",
      "role": "faculty"
    }
  }
}
```

---

## 8. Authentication

All protected endpoints must accept a **Bearer JWT** in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### JWT Payload Structure

```json
{
  "sub": "faculty-1",
  "name": "Dr. Smith",
  "email": "dr.smith@sgtuniversity.edu",
  "department": "CS Department",
  "role": "faculty",
  "iat": 1708185600,
  "exp": 1708272000
}
```

### Protected vs Public Routes

| Route | Auth Required |
|-------|---------------|
| `POST /auth/login` | ❌ No |
| `GET /students` | ✅ Yes |
| `GET /students/:id` | ✅ Yes |
| `POST /students` | ✅ Yes |
| `PUT /students/:id` | ✅ Yes |
| `DELETE /students/:id` | ✅ Yes |
| `GET /attendance/*` | ✅ Yes |
| `GET /analytics/summary` | ✅ Yes |
| `POST /cv/upload` | ✅ Yes |
| `GET /students/export` | ✅ Yes |

### Unauthorized Response (401)

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "UNAUTHORIZED"
}
```

---

## 9. File Upload (CV)

### Upload Flow

```
1. Faculty clicks "Upload CV" or "Re-upload" button
2. Frontend opens modal with file dropzone
3. File validated client-side (PDF only, ≤5MB)
4. POST /cv/upload?studentId=<id> with multipart/form-data
5. Backend stores file, updates student cvStatus to "UPLOADED"
6. Frontend refreshes student list (status badge updates automatically)
```

### Storage Requirements

- Store CVs with a predictable naming convention: `{rollNo}-cv.pdf`
- Return a publicly accessible URL (or a signed URL) in the `cvUrl` field
- Update the student record's `cvStatus` from `"PENDING"` → `"UPLOADED"`

---

## 10. Error Handling

The frontend expects these HTTP status codes:

| Status | Meaning | When to use |
|--------|---------|-------------|
| `200` | OK | Successful GET/PUT |
| `201` | Created | Successful POST (create) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors |
| `401` | Unauthorized | Missing/invalid JWT |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `413` | Payload Too Large | CV file exceeds 5MB |
| `415` | Unsupported Media | Non-PDF file uploaded |
| `422` | Unprocessable Entity | Business logic errors |
| `500` | Server Error | Unexpected errors |

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": "ERROR_CODE",
  "details": {
    "field": "rollNo",
    "reason": "Roll number already exists"
  }
}
```

---

## 11. CORS Configuration

Your backend must allow requests from the frontend origin:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

For production, replace `localhost:3000` with your deployed frontend URL.

---

## 12. Frontend Integration Steps

Once your backend is ready, these are the **only changes** needed on the frontend:

### Step 1 — Set the base URL

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Step 2 — Update `src/lib/api/students.ts`

Replace the mock functions. Example for `getStudents`:

```typescript
// BEFORE (mock):
export async function getStudents(params: StudentQueryParams = {}) {
  let filtered = [...MOCK_STUDENTS];
  // ... mock filtering logic
  return { data, total: 1248, page, limit };
}

// AFTER (real API):
export async function getStudents(params: StudentQueryParams = {}) {
  const res = await fetch(
    `${BASE_URL}/students?${new URLSearchParams(params as any)}`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return res.json();
}
```

### Step 3 — Update `src/lib/api/attendance.ts`

Same pattern — replace mock returns with fetch calls.

### Step 4 — Update `src/lib/api/analytics.ts`

Same pattern.

> **Zero component changes needed.** The components consume TypeScript interfaces, not implementation details.

---

## 13. Data Conventions

| Convention | Format | Example |
|-----------|--------|---------|
| **Roll Number** | `{DEPT}-{YEAR}-{SERIAL}` | `CS-2024-001` |
| **Dates** | ISO 8601 | `2026-02-17T00:00:00Z` |
| **Percentages** | Number (0–100) | `92.4` |
| **CVStatus** | Enum string | `"UPLOADED"` `"PENDING"` `"REJECTED"` |
| **Semester** | Integer (1–8) | `4` |
| **Pagination** | 1-indexed pages | `page=1&limit=10` |
| **Course Slugs** | Lowercase, hyphenated | `btech-cs`, `btech-it` |
| **Course Display** | Proper case with dots | `B.Tech CS`, `B.Tech IT` |

### Course Slug ↔ Display Name Mapping

| Slug | Display Name |
|------|-------------|
| `btech-cs` | B.Tech CS |
| `btech-it` | B.Tech IT |
| `btech-ece` | B.Tech ECE |
| `btech-me` | B.Tech ME |
| `mca` | MCA |

---

## 14. Database Schema Suggestion

Below is a suggested schema (adapt to your DB engine):

### Students Table

```sql
CREATE TABLE students (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  roll_no       VARCHAR(20) UNIQUE NOT NULL,  -- "CS-2024-001"
  course        VARCHAR(50) NOT NULL,          -- "B.Tech CS"
  avatar_url    TEXT,
  cv_status     VARCHAR(10) DEFAULT 'PENDING', -- UPLOADED | PENDING | REJECTED
  cv_url        TEXT,
  attendance_percent DECIMAL(5,2) DEFAULT 0,
  semester      INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
  email         VARCHAR(255),
  phone         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_students_semester ON students(semester);
CREATE INDEX idx_students_cv_status ON students(cv_status);
```

### Faculty Table

```sql
CREATE TABLE faculty (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department    VARCHAR(100) NOT NULL,
  role          VARCHAR(20) DEFAULT 'faculty',
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### Attendance Table

```sql
CREATE TABLE attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      VARCHAR(10) NOT NULL, -- PRESENT | ABSENT | LEAVE
  marked_by   UUID REFERENCES faculty(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
```

---

> **Questions?** Refer to the TypeScript interfaces in `src/lib/types/` — they are the single source of truth for all data shapes the frontend expects.

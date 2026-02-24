"""
EduPulse Backend — Complete API Test Script
============================================
Run:   python test_all_endpoints.py
Needs: pip install requests

This script tests ALL 22 API endpoints against a running server.
Start the server first:  uvicorn app.main:app --reload
"""

import json
import sys
import requests

BASE = "http://localhost:8000/api/v1"
PASS = 0
FAIL = 0
TOKEN = None
CREATED_IDS = {}  # Store IDs of created resources for later tests


def log(ok: bool, method: str, path: str, detail: str = ""):
    global PASS, FAIL
    icon = "✅" if ok else "❌"
    if ok:
        PASS += 1
    else:
        FAIL += 1
    print(f"  {icon} {method:6s} {path:45s} {detail}")


def headers():
    h = {"Content-Type": "application/json"}
    if TOKEN:
        h["Authorization"] = f"Bearer {TOKEN}"
    return h


# ══════════════════════════════════════════
# 0. HEALTH CHECK
# ══════════════════════════════════════════
def test_health():
    print("\n🏥 Health Check")
    print("─" * 60)
    try:
        r = requests.get("http://localhost:8000/health", timeout=5)
        ok = r.status_code == 200 and r.json().get("status") == "ok"
        log(ok, "GET", "/health", f"status={r.status_code}")
        return ok
    except requests.ConnectionError:
        print("  ❌ Server not running! Start with: uvicorn app.main:app --reload")
        return False


# ══════════════════════════════════════════
# 1. AUTH
# ══════════════════════════════════════════
def test_auth():
    global TOKEN
    print("\n🔐 Auth Endpoints")
    print("─" * 60)

    # Register a Dean user
    r = requests.post(f"{BASE}/auth/register", json={
        "full_name": "Test Dean",
        "email": "testdean@edupulse.dev",
        "password": "test1234",
        "role": "dean",
        "organization_name": "Test University",
        "organization_slug": "test-uni",
    }, headers=headers())
    ok = r.status_code in (201, 400)  # 400 = already registered
    log(ok, "POST", "/auth/register", f"status={r.status_code}")

    # Login
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "testdean@edupulse.dev",
        "password": "test1234",
    }, headers=headers())
    ok = r.status_code == 200 and "access_token" in r.json()
    log(ok, "POST", "/auth/login", f"status={r.status_code}")
    if ok:
        TOKEN = r.json()["access_token"]

    # Me
    r = requests.get(f"{BASE}/auth/me", headers=headers())
    ok = r.status_code == 200 and "full_name" in r.json()
    log(ok, "GET", "/auth/me", f"role={r.json().get('role', '?')}")


# ══════════════════════════════════════════
# 2. STUDENTS
# ══════════════════════════════════════════
def test_students():
    print("\n👨‍🎓 Student Endpoints")
    print("─" * 60)

    # Create
    r = requests.post(f"{BASE}/students", json={
        "first_name": "Rahul",
        "last_name": "Sharma",
        "roll_number": "TEST001",
        "email": "rahul@edupulse.dev",
    }, headers=headers())
    ok = r.status_code in (201, 400)
    log(ok, "POST", "/students", f"status={r.status_code}")
    if r.status_code == 201:
        CREATED_IDS["student"] = r.json()["id"]

    # List
    r = requests.get(f"{BASE}/students", headers=headers())
    ok = r.status_code == 200 and isinstance(r.json(), list)
    log(ok, "GET", "/students", f"count={len(r.json())}")
    if r.json() and "student" not in CREATED_IDS:
        CREATED_IDS["student"] = r.json()[0]["id"]

    # Search
    r = requests.get(f"{BASE}/students?search=Rahul", headers=headers())
    ok = r.status_code == 200
    log(ok, "GET", "/students?search=Rahul", f"count={len(r.json())}")

    # Get by ID
    if "student" in CREATED_IDS:
        sid = CREATED_IDS["student"]
        r = requests.get(f"{BASE}/students/{sid}", headers=headers())
        ok = r.status_code == 200
        log(ok, "GET", f"/students/{sid[:8]}...", f"name={r.json().get('first_name', '?')}")


# ══════════════════════════════════════════
# 3. ATTENDANCE
# ══════════════════════════════════════════
def test_attendance():
    print("\n📅 Attendance Endpoints")
    print("─" * 60)

    # Summary
    r = requests.get(f"{BASE}/attendance/summary", headers=headers())
    ok = r.status_code == 200
    log(ok, "GET", "/attendance/summary", f"total={r.json().get('total_records', 0)}")

    # Low attendance
    r = requests.get(f"{BASE}/attendance/low-attendance", headers=headers())
    ok = r.status_code == 200
    log(ok, "GET", "/attendance/low-attendance", f"count={len(r.json())}")


# ══════════════════════════════════════════
# 4. DASHBOARD
# ══════════════════════════════════════════
def test_dashboard():
    print("\n📊 Dashboard Endpoints")
    print("─" * 60)

    r = requests.get(f"{BASE}/dashboard/stats", headers=headers())
    ok = r.status_code == 200
    data = r.json()
    log(ok, "GET", "/dashboard/stats",
        f"students={data.get('total_students', 0)}, "
        f"attendance={data.get('avg_attendance_percentage', 0)}%")


# ══════════════════════════════════════════
# 5. ANNOUNCEMENTS  ← NEW
# ══════════════════════════════════════════
def test_announcements():
    print("\n📢 Announcement Endpoints (NEW)")
    print("─" * 60)

    # Create
    r = requests.post(f"{BASE}/announcements", json={
        "title": "Test Announcement",
        "message": "This is a test announcement from the API test script.",
        "priority": "important",
        "target_course": "all",
    }, headers=headers())
    ok = r.status_code == 201
    log(ok, "POST", "/announcements", f"status={r.status_code}")
    if ok:
        CREATED_IDS["announcement"] = r.json()["id"]

    # List
    r = requests.get(f"{BASE}/announcements", headers=headers())
    ok = r.status_code == 200 and isinstance(r.json(), list)
    log(ok, "GET", "/announcements", f"count={len(r.json())}")

    # Get by ID
    if "announcement" in CREATED_IDS:
        aid = CREATED_IDS["announcement"]
        r = requests.get(f"{BASE}/announcements/{aid}", headers=headers())
        ok = r.status_code == 200
        log(ok, "GET", f"/announcements/{aid[:8]}...", f"title={r.json().get('title', '?')}")

    # Update
    if "announcement" in CREATED_IDS:
        aid = CREATED_IDS["announcement"]
        r = requests.put(f"{BASE}/announcements/{aid}", json={
            "title": "Updated Announcement",
            "priority": "urgent",
        }, headers=headers())
        ok = r.status_code == 200
        log(ok, "PUT", f"/announcements/{aid[:8]}...", f"updated_title={r.json().get('title', '?')}")

    # Filter by priority
    r = requests.get(f"{BASE}/announcements?priority=urgent", headers=headers())
    ok = r.status_code == 200
    log(ok, "GET", "/announcements?priority=urgent", f"count={len(r.json())}")

    # Delete
    if "announcement" in CREATED_IDS:
        aid = CREATED_IDS["announcement"]
        r = requests.delete(f"{BASE}/announcements/{aid}", headers=headers())
        ok = r.status_code == 204
        log(ok, "DELETE", f"/announcements/{aid[:8]}...", f"status={r.status_code}")


# ══════════════════════════════════════════
# 6. FORMS  ← NEW
# ══════════════════════════════════════════
def test_forms():
    print("\n📝 Form Endpoints (NEW)")
    print("─" * 60)

    # Create form
    r = requests.post(f"{BASE}/forms", json={
        "title": "Feedback Form",
        "description": "A test feedback form",
        "status": "active",
        "target_course": "all",
        "fields": [
            {"id": "q1", "type": "text", "label": "Your Name", "required": True},
            {"id": "q2", "type": "radio", "label": "Rating", "required": True,
             "options": [{"label": "Good"}, {"label": "Average"}, {"label": "Poor"}]},
            {"id": "q3", "type": "textarea", "label": "Comments", "required": False},
        ]
    }, headers=headers())
    ok = r.status_code == 201
    log(ok, "POST", "/forms", f"status={r.status_code}")
    if ok:
        CREATED_IDS["form"] = r.json()["id"]

    # List
    r = requests.get(f"{BASE}/forms", headers=headers())
    ok = r.status_code == 200 and isinstance(r.json(), list)
    log(ok, "GET", "/forms", f"count={len(r.json())}")

    # Get by ID
    if "form" in CREATED_IDS:
        fid = CREATED_IDS["form"]
        r = requests.get(f"{BASE}/forms/{fid}", headers=headers())
        ok = r.status_code == 200
        log(ok, "GET", f"/forms/{fid[:8]}...", f"fields={len(r.json().get('fields', []))}")

    # Submit response
    if "form" in CREATED_IDS:
        fid = CREATED_IDS["form"]
        r = requests.post(f"{BASE}/forms/{fid}/submit", json={
            "answers": {"q1": "Test User", "q2": "Good", "q3": "Great form!"}
        }, headers=headers())
        ok = r.status_code == 201
        log(ok, "POST", f"/forms/{fid[:8]}../submit", f"status={r.status_code}")

    # Duplicate submit should fail
    if "form" in CREATED_IDS:
        fid = CREATED_IDS["form"]
        r = requests.post(f"{BASE}/forms/{fid}/submit", json={
            "answers": {"q1": "Again"}
        }, headers=headers())
        ok = r.status_code == 400
        log(ok, "POST", f"/forms/{fid[:8]}../submit (dup)", f"correctly_rejected={r.status_code == 400}")

    # List responses
    if "form" in CREATED_IDS:
        fid = CREATED_IDS["form"]
        r = requests.get(f"{BASE}/forms/{fid}/responses", headers=headers())
        ok = r.status_code == 200 and len(r.json()) >= 1
        log(ok, "GET", f"/forms/{fid[:8]}../responses", f"count={len(r.json())}")

    # Update
    if "form" in CREATED_IDS:
        fid = CREATED_IDS["form"]
        r = requests.put(f"{BASE}/forms/{fid}", json={
            "title": "Updated Feedback Form",
            "status": "closed",
        }, headers=headers())
        ok = r.status_code == 200
        log(ok, "PUT", f"/forms/{fid[:8]}...", f"new_status={r.json().get('status', '?')}")

    # Delete
    if "form" in CREATED_IDS:
        fid = CREATED_IDS["form"]
        r = requests.delete(f"{BASE}/forms/{fid}", headers=headers())
        ok = r.status_code == 204
        log(ok, "DELETE", f"/forms/{fid[:8]}...", f"status={r.status_code}")


# ══════════════════════════════════════════
# 7. FEES  ← NEW
# ══════════════════════════════════════════
def test_fees():
    print("\n💰 Fee Endpoints (NEW)")
    print("─" * 60)

    if "student" not in CREATED_IDS:
        print("  ⚠️  Skipping — no student created")
        return

    sid = CREATED_IDS["student"]

    # Create
    r = requests.post(f"{BASE}/fees", json={
        "student_id": sid,
        "fee_type": "tuition",
        "amount": 50000.00,
        "semester": 3,
        "academic_year": "2025-26",
        "due_date": "2026-03-31",
    }, headers=headers())
    ok = r.status_code == 201
    log(ok, "POST", "/fees", f"status={r.status_code}")
    if ok:
        CREATED_IDS["fee"] = r.json()["id"]

    # List
    r = requests.get(f"{BASE}/fees", headers=headers())
    ok = r.status_code == 200 and isinstance(r.json(), list)
    log(ok, "GET", "/fees", f"count={len(r.json())}")

    # Summary
    r = requests.get(f"{BASE}/fees/summary", headers=headers())
    ok = r.status_code == 200
    log(ok, "GET", "/fees/summary",
        f"total=₹{r.json().get('total_amount', 0)}, "
        f"collected=₹{r.json().get('total_collected', 0)}")

    # Update (record payment)
    if "fee" in CREATED_IDS:
        fid = CREATED_IDS["fee"]
        r = requests.patch(f"{BASE}/fees/{fid}", json={
            "paid_amount": 25000.00,
            "status": "partial",
        }, headers=headers())
        ok = r.status_code == 200
        log(ok, "PATCH", f"/fees/{fid[:8]}...", f"paid=₹{r.json().get('paid_amount', '?')}")

    # Delete
    if "fee" in CREATED_IDS:
        fid = CREATED_IDS["fee"]
        r = requests.delete(f"{BASE}/fees/{fid}", headers=headers())
        ok = r.status_code == 204
        log(ok, "DELETE", f"/fees/{fid[:8]}...", f"status={r.status_code}")


# ══════════════════════════════════════════
# 8. ANALYTICS  ← NEW
# ══════════════════════════════════════════
def test_analytics():
    print("\n📈 Analytics Endpoints (NEW)")
    print("─" * 60)

    # Overview
    r = requests.get(f"{BASE}/analytics/overview", headers=headers())
    ok = r.status_code == 200

    data = r.json()
    log(ok, "GET", "/analytics/overview",
        f"students={data.get('students', {}).get('total', 0)}, "
        f"attendance={data.get('attendance', {}).get('average_percentage', 0)}%")

    # By department
    r = requests.get(f"{BASE}/analytics/attendance-by-department", headers=headers())
    ok = r.status_code == 200
    log(ok, "GET", "/analytics/attendance-by-department", f"departments={len(r.json())}")

    # Top students
    r = requests.get(f"{BASE}/analytics/top-students?limit=5", headers=headers())
    ok = r.status_code == 200
    log(ok, "GET", "/analytics/top-students", f"count={len(r.json())}")


# ══════════════════════════════════════════
# 9. REPORTS  ← NEW
# ══════════════════════════════════════════
def test_reports():
    print("\n📄 Report Endpoints (NEW)")
    print("─" * 60)

    # Attendance report
    r = requests.get(f"{BASE}/reports/attendance", headers=headers())
    ok = r.status_code == 200 and r.json().get("report_type") == "attendance"
    log(ok, "GET", "/reports/attendance",
        f"students={r.json().get('summary', {}).get('total_students', 0)}")

    # Fees report
    r = requests.get(f"{BASE}/reports/fees", headers=headers())
    ok = r.status_code == 200 and r.json().get("report_type") == "fees"
    log(ok, "GET", "/reports/fees",
        f"collection_rate={r.json().get('summary', {}).get('collection_rate', 0)}%")

    # CV status report
    r = requests.get(f"{BASE}/reports/cv-status", headers=headers())
    ok = r.status_code == 200 and r.json().get("report_type") == "cv_status"
    log(ok, "GET", "/reports/cv-status",
        f"coverage={r.json().get('summary', {}).get('cv_coverage_percentage', 0)}%")


# ══════════════════════════════════════════
# 10. RBAC TEST (faculty should be denied)
# ══════════════════════════════════════════
def test_rbac():
    global TOKEN
    print("\n🔒 RBAC Test (Faculty user should be denied on Dean-only endpoints)")
    print("─" * 60)

    # Register a faculty user
    r = requests.post(f"{BASE}/auth/register", json={
        "full_name": "Test Faculty",
        "email": "testfaculty@edupulse.dev",
        "password": "test1234",
        "role": "faculty",
        "organization_name": "Test University",
        "organization_slug": "test-uni",
    }, headers=headers())

    # Login as faculty
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "testfaculty@edupulse.dev",
        "password": "test1234",
    })
    if r.status_code != 200:
        print("  ⚠️  Could not login as faculty, skipping RBAC tests")
        return

    faculty_token = r.json()["access_token"]
    fh = {"Authorization": f"Bearer {faculty_token}", "Content-Type": "application/json"}

    # Faculty should be DENIED on these:
    denied_endpoints = [
        ("POST", f"{BASE}/announcements", {"title": "x", "message": "x"}),
        ("GET", f"{BASE}/fees", None),
        ("GET", f"{BASE}/analytics/overview", None),
    ]

    for method, url, body in denied_endpoints:
        if method == "POST":
            r = requests.post(url, json=body, headers=fh)
        else:
            r = requests.get(url, headers=fh)
        ok = r.status_code == 403
        path = url.replace(BASE, "")
        log(ok, method, f"{path} (as faculty)", f"correctly_denied={r.status_code == 403}")

    # Faculty SHOULD be allowed on these:
    allowed_endpoints = [
        ("GET", f"{BASE}/announcements", None),
        ("GET", f"{BASE}/students", None),
        ("GET", f"{BASE}/forms", None),
    ]

    for method, url, body in allowed_endpoints:
        r = requests.get(url, headers=fh)
        ok = r.status_code == 200
        path = url.replace(BASE, "")
        log(ok, method, f"{path} (as faculty)", f"correctly_allowed={r.status_code == 200}")


# ══════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════
def main():
    print("=" * 60)
    print("  EduPulse API — Complete Test Suite")
    print("=" * 60)

    if not test_health():
        print("\n💀 Server is not running. Start it first:")
        print("   cd backend")
        print("   uvicorn app.main:app --reload")
        sys.exit(1)

    test_auth()
    test_students()
    test_attendance()
    test_dashboard()
    test_announcements()
    test_forms()
    test_fees()
    test_analytics()
    test_reports()
    test_rbac()

    # ── Summary ──
    total = PASS + FAIL
    print("\n" + "=" * 60)
    print(f"  Results: {PASS}/{total} passed, {FAIL} failed")
    if FAIL == 0:
        print("  🎉 ALL TESTS PASSED!")
    else:
        print(f"  ⚠️  {FAIL} test(s) failed — check above for ❌")
    print("=" * 60)

    sys.exit(0 if FAIL == 0 else 1)


if __name__ == "__main__":
    main()

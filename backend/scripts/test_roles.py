"""
Comprehensive RBAC Test Script for EduPulse
============================================
Creates all demo accounts, logs in as each, checks API access, and reports results.

Run: python scripts/test_roles.py
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LOG_FILE = os.path.join(os.path.dirname(__file__), "test_roles_log.txt")

BASE_URL = "http://127.0.0.1:8000"
API = f"{BASE_URL}/api/v1"
PASSWORD = "DemoPass123!"

ACCOUNTS = [
    ("admin@sgtuniversity.edu",               "Administration",   "admin",       None),
    ("dean@sgtuniversity.edu",                "Engineering",      "dean",        None),
    ("hod@sgtuniversity.edu",                 "B.Tech CS",        "hod",         None),
    ("faculty@sgtuniversity.edu",             "B.Tech CS",        "faculty",     None),
    ("placement.coord@sgtuniversity.edu",     "B.Tech CS",        "coordinator", "placement"),
    ("attendance.coord@sgtuniversity.edu",    "B.Tech CS",        "coordinator", "attendance"),
    ("events.coord@sgtuniversity.edu",        "B.Tech CS",        "coordinator", "events"),
]

ENDPOINTS = [
    ("GET",  "/auth/me",                "Get current user"),
    ("GET",  "/users",                  "List staff (admin only)"),
    ("GET",  "/students?page=1&limit=5","List students"),
    ("GET",  "/attendance/top",         "Get attendance data"),
    ("GET",  "/messages/anonymous",     "View anonymous messages"),
]

EXPECTED_ACCESS = {
    "admin":       ["/auth/me", "/users", "/students", "/attendance/top", "/messages/anonymous"],
    "dean":        ["/auth/me", "/students", "/attendance/top", "/messages/anonymous"],
    "hod":         ["/auth/me", "/students", "/attendance/top", "/messages/anonymous"],
    "faculty":     ["/auth/me", "/students", "/attendance/top"],
    "coordinator": ["/auth/me", "/students", "/attendance/top"],
}


def log(msg):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")


def main():
    import requests

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        f.write(f"EduPulse RBAC Test - {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 60 + "\n\n")

    results = []

    log("PHASE 1: Creating / resetting demo accounts\n")

    for email, dept, role, ctype in ACCOUNTS:
        label = f"{role}" + (f" ({ctype})" if ctype else "")
        try:
            resp = requests.post(f"{API}/auth/register", json={
                "email": email, "password": PASSWORD, "department": dept,
            }, timeout=10)

            if resp.status_code == 201:
                log(f"  [CREATED]  {label:30s} {email}")
            elif resp.status_code == 409:
                log(f"  [EXISTS]   {label:30s} {email}")
            else:
                log(f"  [FAILED]   {label:30s} {email} -> {resp.status_code}: {resp.text[:80]}")
        except Exception as e:
            log(f"  [ERROR]    {label:30s} {email} -> {e}")

    log("")
    log("PHASE 2: Testing login + API access per role\n")

    total_checks = 0
    total_pass = 0

    for email, _dept, role, ctype in ACCOUNTS:
        label = f"{role}" + (f" ({ctype})" if ctype else "")
        log(f"  -- {label} ({email}) --")

        try:
            login_resp = requests.post(f"{API}/auth/login", json={
                "email": email, "password": PASSWORD,
            }, timeout=10)

            if login_resp.status_code != 200:
                log(f"    [FAIL] LOGIN: {login_resp.status_code} {login_resp.text[:80]}")
                results.append({"role": label, "login": False})
                continue

            token = login_resp.json().get("access_token", "")
            log(f"    [PASS] Login successful")

        except Exception as e:
            log(f"    [FAIL] LOGIN ERROR: {e}")
            results.append({"role": label, "login": False})
            continue

        headers = {"Authorization": f"Bearer {token}"}

        for method, path, desc in ENDPOINTS:
            total_checks += 1
            endpoint_key = path.split("?")[0]
            expected_paths = EXPECTED_ACCESS.get(role, [])
            should_pass = any(endpoint_key.endswith(ep) for ep in expected_paths)

            try:
                if method == "GET":
                    resp = requests.get(f"{API}{path}", headers=headers, timeout=10)
                else:
                    resp = requests.post(f"{API}{path}", headers=headers, timeout=10)

                status = resp.status_code

                if status == 200:
                    if should_pass:
                        log(f"    [PASS] 200 OK           {desc}")
                        total_pass += 1
                    else:
                        log(f"    [WARN] 200 unexpected   {desc}")
                elif status in (401, 403):
                    if should_pass:
                        log(f"    [FAIL] {status} denied   {desc}")
                    else:
                        log(f"    [PASS] {status} blocked  {desc}")
                        total_pass += 1
                else:
                    log(f"    [WARN] {status}            {desc}")
                    if not should_pass:
                        total_pass += 1

            except Exception as e:
                log(f"    [ERROR] {desc}: {e}")

        results.append({"role": label, "login": True})
        log("")

    log("=" * 60)
    log(f"SUMMARY: {total_pass}/{total_checks} checks passed")
    log("=" * 60)

    for r in results:
        status = "[PASS]" if r.get("login") else "[FAIL]"
        log(f"  {status} {r['role']}")

    log(f"\nFull log: {LOG_FILE}")


if __name__ == "__main__":
    main()

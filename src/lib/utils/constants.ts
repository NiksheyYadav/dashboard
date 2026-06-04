import {
    BookOpen,
    CalendarOff,
    CalendarPlus,
    ClipboardCheck,
    Database,
    FileBarChart,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    UserCog,
    Users,
    AlertTriangle
} from "lucide-react";

export type UserRole = "admin" | "dean" | "hod" | "teacher" | "activity_coordinator";

interface NavItem {
    label: string;
    icon: typeof LayoutDashboard;
    href: string;
}

// Navigation items for non-admin roles
const ALL_NAV_ITEMS: (NavItem & { roles: UserRole[] })[] = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["dean", "hod", "teacher", "activity_coordinator"] },
    { label: "Subject Attendance", icon: BookOpen, href: "/subject-attendance", roles: ["teacher", "hod", "dean"] },
    { label: "Mentee Monitor", icon: Users, href: "/mentee-monitor", roles: ["teacher", "hod", "dean"] },
    { label: "Warning Letters", icon: AlertTriangle, href: "/warning-letters", roles: ["teacher", "hod", "dean"] },
    { label: "Leave & Arrangement", icon: CalendarOff, href: "/leave-arrangement", roles: ["teacher", "hod", "dean"] },
    { label: "Extra Classes", icon: CalendarPlus, href: "/extra-classes", roles: ["teacher", "hod", "dean"] },
    { label: "Activity Attendance", icon: ClipboardCheck, href: "/activity-attendance", roles: ["activity_coordinator", "hod", "dean"] },
    { label: "Reports", icon: FileBarChart, href: "/reports", roles: ["dean", "hod", "teacher", "activity_coordinator"] },
];

// Admin-specific navigation — focused on system configuration
const ADMIN_NAV_ITEMS: NavItem[] = [
    { label: "Dashboard",       icon: LayoutDashboard, href: "/dashboard" },
    { label: "Master Data",     icon: Database,        href: "/academic-data" },
    { label: "Staff Management",icon: UserCog,         href: "/staff" },
    { label: "Audit & Reports", icon: FileBarChart,    href: "/reports" },
    { label: "Rules & Policies",icon: ShieldCheck,     href: "/settings" },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
    if (role === "admin") return ADMIN_NAV_ITEMS;
    return ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
}

// Legacy exports for backward compatibility
export const NAV_ITEMS = ALL_NAV_ITEMS.map(({ roles: _roles, ...item }) => item);

export const SYSTEM_NAV_ITEMS = [
    { label: "Settings", icon: Settings, href: "/settings" },
] as const;

// Programmes/courses — legacy static list for backward compatibility
// Will be replaced with API-driven data in Phase 1
export const COURSES = [
    { value: "all", label: "Course: All" },
    { value: "btech-cse", label: "B.Tech CSE" },
    { value: "btech-it", label: "B.Tech IT" },
    { value: "btech-me", label: "B.Tech ME" },
    { value: "bca", label: "BCA" },
    { value: "mca", label: "MCA" },
] as const;

export const SEMESTERS = [
    { value: 0, label: "Semester: All" },
    { value: 1, label: "1st Sem" },
    { value: 2, label: "2nd Sem" },
    { value: 3, label: "3rd Sem" },
    { value: 4, label: "4th Sem" },
    { value: 5, label: "5th Sem" },
    { value: 6, label: "6th Sem" },
    { value: 7, label: "7th Sem" },
    { value: 8, label: "8th Sem" },
] as const;

export const ACADEMIC_YEARS = [
    { value: "all", label: "Academic Year: All" },
    { value: "2023-24", label: "Academic Year: 2023-24" },
    { value: "2024-25", label: "Academic Year: 2024-25" },
    { value: "2025-26", label: "Academic Year: 2025-26" },
] as const;

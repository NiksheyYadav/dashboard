import {
    BarChart3,
    BookOpen,
    CalendarCheck,
    CreditCard,
    FileText,
    LayoutGrid,
    Settings,
    Upload,
    Users,
} from "lucide-react";

// Teacher navigation
export const TEACHER_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    { label: "Students", icon: Users, href: "/students" },
    { label: "Attendance", icon: CalendarCheck, href: "/attendance" },
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Fees", icon: CreditCard, href: "/fees" },
    { label: "Reports", icon: FileText, href: "/reports" },
] as const;

// Student navigation
export const STUDENT_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    { label: "My Attendance", icon: CalendarCheck, href: "/my-attendance" },
    { label: "My CV", icon: Upload, href: "/my-cv" },
    { label: "Courses", icon: BookOpen, href: "/courses" },
    { label: "Fees", icon: CreditCard, href: "/fees" },
] as const;

// Legacy alias (used by dashboard widgets that don't need role filtering)
export const NAV_ITEMS = TEACHER_NAV_ITEMS;

export const SYSTEM_NAV_ITEMS = [
    { label: "Settings", icon: Settings, href: "/settings" },
] as const;

export const COURSES = [
    { value: "all", label: "All Courses" },
    { value: "btech-cs", label: "B.Tech CS" },
    { value: "btech-it", label: "B.Tech IT" },
    { value: "btech-ece", label: "B.Tech ECE" },
    { value: "btech-me", label: "B.Tech ME" },
    { value: "mca", label: "MCA" },
    { value: "be-mech", label: "B.E. Mech" },
    { value: "be-elec", label: "B.E. Elec" },
    { value: "bba", label: "B.B.A." },
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

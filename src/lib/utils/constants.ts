import { CoordinatorType, UserRole } from "@/lib/auth/auth-context";
import {
    BarChart3,
    Briefcase,
    CalendarCheck,
    ClipboardList,
    CreditCard,
    FileText,
    LayoutGrid,
    MapPin,
    Megaphone,
    MessageSquare,
    Settings,
    Users
} from "lucide-react";

interface NavItem {
    label: string;
    icon: typeof LayoutGrid;
    href: string;
}

// All possible nav items with role + coordinator subtype access
const ALL_NAV_ITEMS: (NavItem & { roles: UserRole[]; coordTypes?: CoordinatorType[] })[] = [
    { label: "Dashboard", icon: LayoutGrid, href: "/dashboard", roles: ["admin", "dean", "hod", "coordinator", "faculty"] },
    { label: "Staff Management", icon: Users, href: "/staff", roles: ["admin"] },
    { label: "Students", icon: Users, href: "/students", roles: ["admin", "dean", "hod", "coordinator", "faculty"] },
    { label: "Attendance", icon: CalendarCheck, href: "/attendance", roles: ["admin", "dean", "hod", "coordinator", "faculty"], coordTypes: ["attendance"] },
    { label: "Events", icon: MapPin, href: "/events", roles: ["admin", "dean", "hod", "coordinator", "faculty"], coordTypes: ["events"] },
    { label: "Forms", icon: ClipboardList, href: "/forms", roles: ["admin", "dean", "hod", "coordinator", "faculty"] },
    { label: "Announcements", icon: Megaphone, href: "/announcements", roles: ["admin", "dean", "hod"] },
    { label: "Analytics", icon: BarChart3, href: "/analytics", roles: ["admin", "dean", "hod"] },
    { label: "Placement", icon: Briefcase, href: "/placement", roles: ["admin", "dean", "hod", "coordinator", "faculty"], coordTypes: ["placement"] },
    { label: "Fees", icon: CreditCard, href: "/fees", roles: ["admin", "dean", "hod"] },
    { label: "Changelog", icon: FileText, href: "/changelog", roles: ["admin", "dean", "hod", "coordinator", "faculty"] },
    { label: "Reports", icon: FileText, href: "/reports", roles: ["admin", "dean", "hod", "coordinator"] },
    { label: "Messages", icon: MessageSquare, href: "/anonymous-messages", roles: ["admin", "dean", "hod"] },
];

export function getNavItemsForRole(role: UserRole, coordType?: CoordinatorType): NavItem[] {
    return ALL_NAV_ITEMS.filter((item) => {
        if (!item.roles.includes(role)) return false;
        // For coordinators, filter by subtype if the page specifies coordTypes
        if (role === "coordinator" && item.coordTypes) {
            return coordType != null && item.coordTypes.includes(coordType);
        }
        return true;
    });
}

// Legacy exports for backward compatibility
export const TEACHER_NAV_ITEMS = ALL_NAV_ITEMS.map(({ roles: _roles, coordTypes: _ct, ...item }) => item);
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

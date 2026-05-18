import { apiGet } from "@/lib/api/client";

export async function getTeacherDashboard() {
    return apiGet<{
        todays_classes: number;
        pending_attendance: number;
        assigned_subjects: number;
        assigned_mentees: number;
    }>("/dashboard/teacher");
}

export async function getAssignedSubjects() {
    return apiGet<Array<{ id: string; code: string; name: string; planned_lecture_count: number }>>("/attendance/assigned-subjects");
}

export async function getMentorMentees() {
    return apiGet<Array<{ id: string; name: string; roll_no: string; overall_percentage: number; risk_status: string }>>("/mentor/mentees");
}

export async function getExtraClassList(teacherId: string) {
    return apiGet<Array<{ id: string; date: string; subject_id: string; section_id: string; class_type: string; attendance_marked: boolean; approved: boolean }>>(`/extra-class/list/${teacherId}`);
}

export async function getNotifications(unread = true) {
    return apiGet<Array<{ id: string; type: string; message: string; read: boolean; created_at: string }>>(`/notifications?unread=${unread}`);
}

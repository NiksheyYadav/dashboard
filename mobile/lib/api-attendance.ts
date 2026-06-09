import { api } from './api';

export type ClassType = 'Regular' | 'Extra' | 'Arrangement';
export type AttendanceStatus = 'Pending' | 'Completed';

export interface TimetableSlot {
    id: string;
    subjectName: string;
    subjectCode: string;
    programme: string;
    semester: string;
    section: string;
    time: string;
    classType: ClassType;
    status: AttendanceStatus;
    totalStudents: number;
}

export interface Student {
    id: string;
    rollNo: string;
    name: string;
    status: 'Present' | 'Absent' | 'Pending';
}

// Mock Data
const MOCK_TIMETABLE: TimetableSlot[] = [
    {
        id: 'slot_1',
        subjectName: 'Data Structures',
        subjectCode: 'CS301',
        programme: 'B.Tech CSE',
        semester: 'Sem III',
        section: 'A',
        time: '09:00 AM - 10:00 AM',
        classType: 'Regular',
        status: 'Pending',
        totalStudents: 60,
    },
    {
        id: 'slot_2',
        subjectName: 'Operating Systems',
        subjectCode: 'CS302',
        programme: 'B.Tech CSE',
        semester: 'Sem III',
        section: 'B',
        time: '10:00 AM - 11:00 AM',
        classType: 'Arrangement',
        status: 'Pending',
        totalStudents: 55,
    },
    {
        id: 'slot_3',
        subjectName: 'AI Basics',
        subjectCode: 'AI301',
        programme: 'B.Tech AI',
        semester: 'Sem III',
        section: 'A',
        time: '12:00 PM - 01:00 PM',
        classType: 'Extra',
        status: 'Completed',
        totalStudents: 45,
    },
];

const MOCK_STUDENTS: Student[] = Array.from({ length: 60 }).map((_, i) => ({
    id: `stu_${i + 1}`,
    rollNo: `23CS${(100 + i).toString()}`,
    name: `Student ${i + 1}`,
    status: 'Pending',
}));

// API Methods
export async function getTodaysTimetable(): Promise<TimetableSlot[]> {
    // In production: return api.get('/api/v1/attendance/timetable/today').then(res => res.data);
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_TIMETABLE), 800);
    });
}

export async function getClassStudents(slotId: string): Promise<Student[]> {
    // In production: return api.get(`/api/v1/attendance/slot/${slotId}/students`).then(res => res.data);
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_STUDENTS), 600);
    });
}

export async function submitAttendance(slotId: string, attendanceData: { studentId: string; status: string }[], noClassConducted: boolean = false): Promise<boolean> {
    // In production: return api.post(`/api/v1/attendance/slot/${slotId}/submit`, { attendanceData, noClassConducted }).then(() => true);
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), 1200);
    });
}

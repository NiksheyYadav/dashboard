import { api } from './api';

export type RiskStatus = 'Safe' | 'Warning' | 'Critical';

export interface MenteeSubject {
    subjectCode: string;
    subjectName: string;
    attendancePercent: number;
}

export interface Mentee {
    id: string;
    rollNo: string;
    name: string;
    batch: string;
    overallPercent: number;
    riskStatus: RiskStatus;
    subjects: MenteeSubject[];
    lastCounsellingDate?: string;
}

// Mock Data
const MOCK_MENTEES: Mentee[] = [
    {
        id: 'mentee_1',
        rollNo: '23CS101',
        name: 'Aarav Sharma',
        batch: 'B.Tech CSE Sem III',
        overallPercent: 88,
        riskStatus: 'Safe',
        lastCounsellingDate: '2026-05-10',
        subjects: [
            { subjectCode: 'CS301', subjectName: 'Data Structures', attendancePercent: 90 },
            { subjectCode: 'CS302', subjectName: 'Operating Systems', attendancePercent: 85 },
        ]
    },
    {
        id: 'mentee_2',
        rollNo: '23CS102',
        name: 'Riya Gupta',
        batch: 'B.Tech CSE Sem III',
        overallPercent: 72,
        riskStatus: 'Warning',
        lastCounsellingDate: '2026-06-01',
        subjects: [
            { subjectCode: 'CS301', subjectName: 'Data Structures', attendancePercent: 70 },
            { subjectCode: 'CS302', subjectName: 'Operating Systems', attendancePercent: 74 },
        ]
    },
    {
        id: 'mentee_3',
        rollNo: '23CS103',
        name: 'Vikram Singh',
        batch: 'B.Tech CSE Sem III',
        overallPercent: 58,
        riskStatus: 'Critical',
        subjects: [
            { subjectCode: 'CS301', subjectName: 'Data Structures', attendancePercent: 55 },
            { subjectCode: 'CS302', subjectName: 'Operating Systems', attendancePercent: 61 },
        ]
    }
];

// API Methods
export async function getMyMentees(): Promise<Mentee[]> {
    // In production: return api.get('/api/v1/mentorship/mentees').then(res => res.data);
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_MENTEES), 600);
    });
}

export async function addCounsellingNote(menteeId: string, note: string): Promise<boolean> {
    // In production: return api.post(`/api/v1/mentorship/mentees/${menteeId}/notes`, { note }).then(() => true);
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), 1000);
    });
}

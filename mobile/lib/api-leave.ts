import { api } from './api';

export interface LeaveRequest {
    id: string;
    date: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    arrangementTeacherName: string;
}

export interface Teacher {
    id: string;
    name: string;
    department: string;
}

// Mock Data
const MOCK_LEAVES: LeaveRequest[] = [
    {
        id: 'leave_1',
        date: '2026-06-10',
        reason: 'Medical Leave',
        status: 'Approved',
        arrangementTeacherName: 'Dr. John Doe',
    },
    {
        id: 'leave_2',
        date: '2026-06-15',
        reason: 'Personal Work',
        status: 'Pending',
        arrangementTeacherName: 'Dr. Jane Smith',
    }
];

const MOCK_TEACHERS: Teacher[] = [
    { id: 't_1', name: 'Dr. John Doe', department: 'CSE' },
    { id: 't_2', name: 'Dr. Jane Smith', department: 'CSE' },
    { id: 't_3', name: 'Prof. Mark Wood', department: 'AI' },
];

export async function getMyLeaves(): Promise<LeaveRequest[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_LEAVES), 500));
}

export async function getAvailableTeachers(): Promise<Teacher[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_TEACHERS), 300));
}

export async function applyForLeave(date: string, reason: string, arrangementId: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 1200));
}

export async function getPendingApprovals(): Promise<LeaveRequest[]> {
    // Used by HoD
    return new Promise((resolve) => setTimeout(() => resolve([{
        id: 'leave_3',
        date: '2026-06-18',
        reason: 'Attending Conference',
        status: 'Pending',
        arrangementTeacherName: 'Dr. Jane Smith',
    }]), 600));
}

export async function respondToLeave(leaveId: string, approved: boolean): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 800));
}

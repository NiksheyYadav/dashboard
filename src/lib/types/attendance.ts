export interface TopPerformerData {
    name: string;
    attendance: number;
}

export interface WeeklyTrendData {
    week: string;
    attendance: number;
}

export interface DistributionData {
    present: number;
    absent: number;
    leave: number;
}

export interface DashboardStats {
    totalStudents: number;
    totalStudentsTrend: number;
    cvsUploaded: number;
    cvsUploadedLabel: string;
    avgAttendance: number;
    avgAttendanceTrend: number;
    lowAttendance: number;
}

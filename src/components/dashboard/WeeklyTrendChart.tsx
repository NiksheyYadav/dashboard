"use client";

import { WeeklyTrendData } from "@/lib/types/attendance";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface WeeklyTrendChartProps {
    data: WeeklyTrendData[];
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Weekly Attendance Trend
            </h3>
            <div className="h-[110px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis hide domain={[60, 100]} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                fontSize: "12px",
                            }}
                            formatter={(value: number | string | undefined) => [`${value}%`, "Attendance"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke="#1a6fdb"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, fill: "#1a6fdb" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

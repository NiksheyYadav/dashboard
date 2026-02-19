"use client";

import { TopPerformerData } from "@/lib/types/attendance";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface AttendanceBarChartProps {
    data: TopPerformerData[];
}

export default function AttendanceBarChart({ data }: AttendanceBarChartProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                    Attendance per Student (Top performant)
                </h3>
                <select className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-[#1a6fdb]">
                    <option>Current Semester</option>
                    <option>Semester 3</option>
                    <option>Semester 2</option>
                    <option>Semester 1</option>
                </select>
            </div>

            {/* Chart */}
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#9ca3af" }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                fontSize: "13px",
                            }}
                            formatter={(value: number | string | undefined) => [`${value}%`, "Attendance"]}
                        />
                        <Bar dataKey="attendance" radius={[6, 6, 0, 0]} maxBarSize={45}>
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index % 2 === 0 ? "#3b8ee6" : "#6db3f2"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

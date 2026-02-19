"use client";

import { DistributionData } from "@/lib/types/attendance";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface DistributionDonutProps {
    data: DistributionData;
}

const COLORS = ["#1a6fdb", "#f59e0b", "#d1d5db"];

export default function DistributionDonut({ data }: DistributionDonutProps) {
    const chartData = [
        { name: "Present", value: data.present },
        { name: "Absent", value: data.absent },
        { name: "Leave", value: data.leave },
    ];

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Overall Distribution
            </h3>
            <div className="flex items-center gap-4">
                {/* Donut */}
                <div className="relative h-[100px] w-[100px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={45}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                strokeWidth={0}
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-800">
                            {data.present}%
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#1a6fdb]" />
                        <span className="text-xs text-gray-600">PRESENT</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                        <span className="text-xs text-gray-600">ABSENT</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#d1d5db]" />
                        <span className="text-xs text-gray-600">LEAVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

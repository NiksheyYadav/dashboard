"use client";

import {
    Award,
    Banknote,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Percent,
    Plus,
    Users
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// Mock data components can go here

const TREND_DATA = [
    { name: "Jan", lastYear: 120, thisYear: 140 },
    { name: "Feb", lastYear: 130, thisYear: 160 },
    { name: "Mar", lastYear: 170, thisYear: 190 },
    { name: "Apr", lastYear: 190, thisYear: 240 },
    { name: "May", lastYear: 220, thisYear: 210 },
    { name: "Jun", lastYear: 240, thisYear: 280 },
];

export default function PlacementDashboard() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Placement Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overview of recruitment activities and statistics</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Academic Year 2023-24</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>

                    <button className="flex items-center gap-2 bg-[#1a6fdb] hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm">
                        <Plus className="h-4 w-4" />
                        <span>New Job Posting</span>
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Eligible */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Eligible</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">1,240</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Final Year Students</p>
                    </div>
                </div>

                {/* Students Placed */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students Placed</p>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">1,054</h3>
                        </div>
                        <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                            +12% from last month
                        </p>
                    </div>
                </div>

                {/* Placement % */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placement %</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <Percent className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">85%</h3>
                        <div className="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Avg & Highest Package Combined Card style from image */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Package</p>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-md">
                                <Banknote className="h-3.5 w-3.5 text-amber-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">$8.5 LPA</h3>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">Core & Tech Average</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Highest Package</p>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-md">
                                <Award className="h-3.5 w-3.5 text-purple-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">$45 LPA</h3>
                            <p className="text-[10px] text-purple-500 font-medium mt-1 leading-tight">Secured by IT Dept</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Placements by Dept */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Placements by Dept</h3>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Computer Science</span>
                                <span className="text-gray-500 dark:text-gray-400">342</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#1a6fdb] h-2 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Information Tech</span>
                                <span className="text-gray-500 dark:text-gray-400">280</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#1a6fdb] h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Electronics</span>
                                <span className="text-gray-500 dark:text-gray-400">190</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#7ca9f0] h-2 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Mechanical</span>
                                <span className="text-gray-500 dark:text-gray-400">145</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#a8c7f5] h-2 rounded-full" style={{ width: '35%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Civil</span>
                                <span className="text-gray-500 dark:text-gray-400">97</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                <div className="bg-[#d4e4fa] h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recruitment Trend Bar Chart Placeholder */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Recruitment Trend (6 Months)</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#1a6fdb]"></div>
                                <span className="text-gray-500 dark:text-gray-400">2024</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <span className="text-gray-500 dark:text-gray-400">2023</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[220px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(26, 111, 219, 0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="thisYear" fill="#1a6fdb" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Upcoming Campus Drives */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Upcoming Campus Drives</h3>
                        <a href="#" className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</a>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-4 font-medium">Company</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Package</th>
                                    <th className="px-6 py-4 font-medium text-right">Eligibility</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {/* Drive 1 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1.5 border border-gray-100 dark:border-gray-700">
                                                <div className="w-full h-full bg-[#4285F4] rounded-sm"></div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Google</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 12, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$32 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            8.5+ CGPA
                                        </span>
                                    </td>
                                </tr>
                                {/* Drive 2 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1.5 border border-gray-100 dark:border-gray-700">
                                                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                                                    <div className="bg-[#F25022] rounded-tl-sm"></div>
                                                    <div className="bg-[#7FBA00] rounded-tr-sm"></div>
                                                    <div className="bg-[#00A4EF] rounded-bl-sm"></div>
                                                    <div className="bg-[#FFB900] rounded-br-sm"></div>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Microsoft</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 15, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$28 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            8.0+ CGPA
                                        </span>
                                    </td>
                                </tr>
                                {/* Drive 3 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1.5 border border-gray-100 dark:border-gray-700">
                                                <div className="w-full text-[10px] font-bold text-center leading-tight">Acc.</div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Accenture</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 20, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$6.5 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            7.0+ CGPA
                                        </span>
                                    </td>
                                </tr>
                                {/* Drive 4 */}
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 flex flex-shrink-0 items-center justify-center p-1 border border-gray-100 dark:border-gray-700">
                                                <div className="w-full h-3 flex justify-center overflow-hidden">
                                                    <div className="w-full text-[10px] font-bold text-center text-[#FF9900] leading-none">az</div>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Amazon</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 dark:text-gray-300">Oct 25, 2024</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">$24 LPA</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            7.5+ CGPA
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Success Stories */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Success Stories</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-filter"><path d="M3 6h18" /><path d="M7 12h10" /><path d="M10 18h4" /></svg>
                            <span>Recently Hired</span>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Story 1 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus`} alt="Avatar" className="h-8 w-8 rounded-full" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Marcus J. Thorne</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">CS-2024-0421 • CGPA 9.2</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">NVIDIA</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$42.5 LPA</p>
                            </div>
                        </div>

                        {/* Story 2 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`} alt="Avatar" className="h-12 w-12 rounded-full absolute top-1" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Sarah Al-Zayed</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">IT-2024-0118 • CGPA 8.8</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Atlassian</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$34.0 LPA</p>
                            </div>
                        </div>

                        {/* Story 3 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan`} alt="Avatar" className="h-10 w-10 rounded-full absolute top-0.5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Rohan Deshmukh</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">ME-2024-0056 • CGPA 8.4</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Tesla</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$28.2 LPA</p>
                            </div>
                        </div>

                        {/* Story 4 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-black relative overflow-hidden flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&baseColor=ffffff`} alt="Avatar" className="h-10 w-10 rounded-full absolute top-0.5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Elena Gilbert</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">EC-2024-0922 • CGPA 9.0</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Intel</p>
                                <p className="text-xs text-emerald-500 font-medium mt-0.5">$22.0 LPA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placement Funnel Status Cards below */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Placement Funnel Status</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
                        <p className="text-[10px] font-bold text-[#1a6fdb] dark:text-blue-400 uppercase tracking-wide">Placed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">1,054</p>
                    </div>

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100/50 dark:border-blue-800/30">
                        <p className="text-[10px] font-bold text-[#3b93fa] dark:text-blue-400 uppercase tracking-wide">In-process</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">128</p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800/50">
                        <p className="text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wide">Not Interested</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">42</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Awaiting Eligibility</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">16</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


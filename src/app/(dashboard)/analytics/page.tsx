import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">
                    In-depth analytics and performance metrics
                </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Advanced Analytics
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    This page will display comprehensive analytics including department
                    comparisons, year-over-year trends, and predictive insights. Connect
                    to backend to populate.
                </p>
            </div>
        </div>
    );
}

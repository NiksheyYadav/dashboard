import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-sm text-gray-500">
                        Generate and download student reports
                    </p>
                </div>
                <Button className="gap-2 bg-[#1a6fdb] text-white hover:bg-[#1560c2]">
                    <Download className="h-4 w-4" />
                    Generate Report
                </Button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Report Center
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    This page will allow generating student reports in CSV/PDF format with
                    custom filters for course, semester, attendance, and CV status. Connect
                    to backend to populate.
                </p>
            </div>
        </div>
    );
}

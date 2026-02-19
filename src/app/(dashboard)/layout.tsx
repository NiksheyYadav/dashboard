import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f4f6fa]">
            <Sidebar />
            <div className="ml-[220px]">
                <Topbar />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}

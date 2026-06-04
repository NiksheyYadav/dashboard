"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { apiUrl } from "@/lib/api/config";
import { Check, Mail, AlertTriangle } from "lucide-react";

type LetterStatus = "unapproved" | "approved" | "dispatched";

interface WarningLetter {
    id: string;
    letter_no: string;
    student_name: string;
    stage: string;
    issue_date: string;
    status: LetterStatus;
}

export default function WarningLettersPage() {
    const { user, role } = useAuth();
    const [letters, setLetters] = useState<WarningLetter[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "ready" | "dispatched">("pending");

    const fetchLetters = async () => {
        setLoading(true);
        try {
            const res = await fetch(apiUrl("/warning-letters"));
            if (res.ok) {
                const data = await res.json();
                setLetters(data);
            } else {
                console.error("Failed to fetch warning letters");
            }
        } catch (error) {
            console.error("Error fetching warning letters:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLetters();
    }, []);

    const filteredLetters = letters.filter((l) => {
        if (activeTab === "pending") return l.status === "unapproved";
        if (activeTab === "ready") return l.status === "approved";
        if (activeTab === "dispatched") return l.status === "dispatched";
        return true;
    });

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(apiUrl(`/warning-letters/${id}/approve`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                fetchLetters();
            } else {
                console.error("Failed to approve");
            }
        } catch (error) {
            console.error("Error approving letter:", error);
        }
    };

    const handleDispatch = async (id: string) => {
        try {
            const res = await fetch(apiUrl(`/warning-letters/${id}/dispatch`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ delivery_method: "Email" })
            });
            if (res.ok) {
                fetchLetters();
            } else {
                console.error("Failed to dispatch");
            }
        } catch (error) {
            console.error("Error dispatching letter:", error);
        }
    };

    const isHodOrDean = role === "hod" || role === "dean";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                    Warning Letters
                </h1>
                <p className="text-sm text-gray-500">Manage and track student warning letters.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "pending" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Pending Approval
                </button>
                <button
                    onClick={() => setActiveTab("ready")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "ready" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Ready to Dispatch
                </button>
                <button
                    onClick={() => setActiveTab("dispatched")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "dispatched" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    Dispatched
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letter No</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredLetters.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No warning letters found.
                                </td>
                            </tr>
                        ) : (
                            filteredLetters.map((letter) => (
                                <tr key={letter.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{letter.letter_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{letter.student_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            {letter.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(letter.issue_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            letter.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            letter.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {letter.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        {letter.status === "unapproved" && isHodOrDean && (
                                            <button
                                                onClick={() => handleApprove(letter.id)}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                                            >
                                                <Check className="w-4 h-4" /> Approve
                                            </button>
                                        )}
                                        {letter.status === "approved" && (
                                            <button
                                                onClick={() => handleDispatch(letter.id)}
                                                className="inline-flex items-center gap-1 text-green-600 hover:text-green-900"
                                            >
                                                <Mail className="w-4 h-4" /> Dispatch
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

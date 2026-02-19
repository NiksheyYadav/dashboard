import { CreditCard } from "lucide-react";

export default function FeesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
                <p className="text-sm text-gray-500">
                    Manage student fee records and payment tracking
                </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Fee Management
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    This page will display fee structures, payment history, and
                    outstanding balances. Connect to backend to populate.
                </p>
            </div>
        </div>
    );
}

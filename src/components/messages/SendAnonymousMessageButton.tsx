"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Loader2, MessageSquarePlus, Send } from "lucide-react";
import { useState } from "react";

export function SendAnonymousMessageButton() {
    const { role } = useAuth();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Only faculty and coordinators should see this button
    if (role === "dean" || role === "hod") {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatus("loading");
        try {
            const res = await fetch(`${API_BASE_URL}/messages/anonymous`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message }),
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }

            setStatus("success");
            setTimeout(() => {
                setOpen(false);
                setMessage("");
                setStatus("idle");
            }, 2000);
        } catch (error) {
            setStatus("error");
            setErrorMsg(error instanceof Error ? error.message : "An error occurred");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="flex w-full items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                    title="Send anonymous feedback to the Dean"
                >
                    <MessageSquarePlus className="h-4 w-4" />
                    Message Dean
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Anonymous Feedback</DialogTitle>
                    <DialogDescription>
                        Send a message directly to the Dean. Your identity is stripped and completely hidden.
                    </DialogDescription>
                </DialogHeader>

                {status === "success" ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <Send className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-center font-medium text-emerald-800 dark:text-emerald-300">
                            Message sent securely!
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            required
                            className="min-h-[120px] w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#1a6fdb] focus:ring-2 focus:ring-[#1a6fdb]/10 dark:border-gray-800 dark:bg-gray-950 dark:focus:border-blue-500"
                        />

                        {status === "error" && (
                            <p className="text-sm font-medium text-red-500 dark:text-red-400">
                                {errorMsg}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={status === "loading" || !message.trim()}
                                className="inline-flex items-center justify-center rounded-xl bg-[#1a6fdb] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1560c2] disabled:opacity-50"
                            >
                                {status === "loading" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Send Anonymously"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

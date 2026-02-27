"use client";

import RequireRole from "@/components/providers/RequireRole";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import {
    CalendarDays,
    Clock,
    DoorOpen,
    MapPin,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { useState } from "react";

interface EventBooking {
    id: string;
    eventName: string;
    roomNumber: string;
    date: string;
    timeSlot: string;
    bookedBy: string;
    status: "confirmed" | "pending" | "cancelled";
}

const TIME_SLOTS = [
    "8:00 AM - 9:00 AM",
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
];

const ROOMS = [
    "E-101", "E-102", "E-103", "E-104", "E-105",
    "E-201", "E-202", "E-203", "E-204", "E-205",
    "E-301", "E-302", "E-303", "E-304", "E-305",
    "Auditorium A", "Auditorium B", "Seminar Hall",
    "Computer Lab 1", "Computer Lab 2",
];

const MOCK_EVENTS: EventBooking[] = [
    { id: "1", eventName: "Faculty Development Program", roomNumber: "Auditorium A", date: "2026-03-01", timeSlot: "10:00 AM - 12:00 PM", bookedBy: "faculty@sgtuniversity.edu", status: "confirmed" },
    { id: "2", eventName: "Guest Lecture - AI Ethics", roomNumber: "E-201", date: "2026-03-03", timeSlot: "2:00 PM - 3:00 PM", bookedBy: "faculty@sgtuniversity.edu", status: "pending" },
    { id: "3", eventName: "Placement Drive", roomNumber: "Seminar Hall", date: "2026-03-05", timeSlot: "9:00 AM - 4:00 PM", bookedBy: "placement.coord@sgtuniversity.edu", status: "confirmed" },
];

let eventIdCounter = 100;

function EventsContent() {
    const { user, role } = useAuth();
    const [events, setEvents] = useState<EventBooking[]>(MOCK_EVENTS);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Form fields
    const [eventName, setEventName] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");

    const isReadOnly = role === "dean" || role === "hod";

    const handleCreate = () => {
        if (!eventName.trim() || !roomNumber || !date || !timeSlot) return;

        const newEvent: EventBooking = {
            id: String(++eventIdCounter),
            eventName: eventName.trim(),
            roomNumber,
            date,
            timeSlot,
            bookedBy: user?.email || "unknown",
            status: "pending",
        };

        setEvents([newEvent, ...events]);
        setEventName("");
        setRoomNumber("");
        setDate("");
        setTimeSlot("");
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        setEvents(events.filter((e) => e.id !== id));
    };

    const filteredEvents = events.filter(
        (e) =>
            e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusColors: Record<string, string> = {
        confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
        pending: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
        cancelled: "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400",
    };

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl flex items-center gap-2">
                        <MapPin className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                        Event Room Booking
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Mark and manage rooms for upcoming events in E-Block.
                    </p>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1a6fdb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1560c2] active:scale-[0.98]"
                    >
                        {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {showForm ? "Cancel" : "Book Room"}
                    </button>
                )}
            </div>

            {/* Create Event Form */}
            {showForm && !isReadOnly && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 dark:border-indigo-900/30 dark:bg-indigo-950/10">
                    <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        New Event Booking
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                Event Name
                            </label>
                            <input
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                placeholder="e.g. Guest Lecture"
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                Room
                            </label>
                            <select
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                <option value="">Select Room</option>
                                {ROOMS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                Time Slot
                            </label>
                            <select
                                value={timeSlot}
                                onChange={(e) => setTimeSlot(e.target.value)}
                                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#1a6fdb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                <option value="">Select Slot</option>
                                {TIME_SLOTS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={!eventName.trim() || !roomNumber || !date || !timeSlot}
                        className="mt-4 rounded-lg bg-[#1a6fdb] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1560c2] disabled:opacity-50 active:scale-[0.98]"
                    >
                        Confirm Booking
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events or rooms..."
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm outline-none focus:border-[#1a6fdb] focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
            </div>

            {/* Events Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50/50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Event</th>
                                <th className="px-6 py-4 font-medium">Room</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Time</th>
                                <th className="px-6 py-4 font-medium">Booked By</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                {!isReadOnly && (
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={isReadOnly ? 6 : 7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                                                <DoorOpen className="h-6 w-6" />
                                            </div>
                                            <p className="font-medium">No events found</p>
                                            <p className="mt-1 text-sm">Book a room to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((event) => (
                                    <tr
                                        key={event.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-indigo-500 shrink-0" />
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {event.eventName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                                <DoorOpen className="h-3.5 w-3.5" />
                                                {event.roomNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                            {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {event.timeSlot}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {event.bookedBy.split("@")[0]}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize",
                                                    statusColors[event.status]
                                                )}
                                            >
                                                {event.status}
                                            </span>
                                        </td>
                                        {!isReadOnly && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-950/50 dark:hover:text-red-500"
                                                    title="Cancel Event"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function EventsPage() {
    return (
        <RequireRole allowedRoles={["admin", "dean", "hod", "coordinator", "faculty"]}>
            <EventsContent />
        </RequireRole>
    );
}

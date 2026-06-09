import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getClassStudents, submitAttendance, Student, getTodaysTimetable, TimetableSlot } from '../../../lib/api-attendance';
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';

export default function AttendanceScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    
    const [students, setStudents] = useState<Student[]>([]);
    const [slot, setSlot] = useState<TimetableSlot | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [studentData, timetable] = await Promise.all([
                    getClassStudents(id as string),
                    getTodaysTimetable(),
                ]);
                setStudents(studentData);
                const matched = timetable.find(s => s.id === id);
                if (matched) setSlot(matched);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const toggleAttendance = (studentId: string, status: 'Present' | 'Absent') => {
        setStudents(current => current.map(s => 
            s.id === studentId ? { ...s, status } : s
        ));
    };

    const markAllPresent = () => {
        setStudents(current => current.map(s => ({ ...s, status: 'Present' })));
    };

    const handleSubmit = async () => {
        const unrecorded = students.filter(s => s.status === 'Pending').length;
        
        if (unrecorded > 0) {
            Alert.alert(
                "Unrecorded Students",
                `There are ${unrecorded} students not marked. Do you want to submit anyway?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Submit", onPress: doSubmit }
                ]
            );
        } else {
            doSubmit();
        }
    };

    const doSubmit = async () => {
        setSubmitting(true);
        try {
            const data = students.map(s => ({ studentId: s.id, status: s.status }));
            await submitAttendance(id as string, data);
            Alert.alert("Success", "Attendance submitted successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to submit attendance.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNoClass = () => {
        Alert.alert(
            "No Class Conducted",
            "This will mark the lecture as 'No Class Conducted' and will not count towards your course completion.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    style: "destructive",
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await submitAttendance(id as string, [], true);
                            router.back();
                        } catch (error) {
                            Alert.alert("Error", "Failed to mark as no class.");
                        } finally {
                            setSubmitting(false);
                        }
                    } 
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#f4f6fa] justify-center items-center">
                <ActivityIndicator size="large" color="#1a6fdb" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#f4f6fa]" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center justify-between z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                        <ChevronLeft size={24} color="#0a1628" />
                    </TouchableOpacity>
                    <View className="ml-2">
                        <Text className="text-gray-900 font-bold text-lg leading-tight">Mark Attendance</Text>
                        <Text className="text-gray-500 text-xs">{slot ? `${slot.subjectCode} • ${slot.semester} ${slot.section}` : 'Loading...'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={markAllPresent} className="bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <Text className="text-emerald-700 font-bold text-xs">ALL PRESENT</Text>
                </TouchableOpacity>
            </View>

            {/* Student List */}
            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {students.map((student, index) => (
                    <View key={student.id} className="bg-white rounded-2xl mb-3 p-4 flex-row items-center justify-between border border-gray-100 shadow-sm">
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                <Text className="text-gray-500 font-bold text-xs">{index + 1}</Text>
                            </View>
                            <View>
                                <Text className="text-gray-900 font-bold text-base leading-tight">{student.name}</Text>
                                <Text className="text-gray-400 text-xs mt-0.5">{student.rollNo}</Text>
                            </View>
                        </View>
                        
                        <View className="flex-row space-x-2">
                            {/* Absent Button */}
                            <TouchableOpacity 
                                onPress={() => toggleAttendance(student.id, 'Absent')}
                                className={`w-11 h-11 rounded-full items-center justify-center ${student.status === 'Absent' ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-50 border border-gray-200'}`}
                            >
                                <XCircle size={20} color={student.status === 'Absent' ? '#ef4444' : '#9ca3af'} />
                            </TouchableOpacity>

                            {/* Present Button */}
                            <TouchableOpacity 
                                onPress={() => toggleAttendance(student.id, 'Present')}
                                className={`w-11 h-11 rounded-full items-center justify-center ml-2 ${student.status === 'Present' ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-gray-50 border border-gray-200'}`}
                            >
                                <CheckCircle2 size={20} color={student.status === 'Present' ? '#10b981' : '#9ca3af'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                <View className="h-24" />
            </ScrollView>

            {/* Bottom Actions */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex-row">
                <TouchableOpacity 
                    onPress={handleNoClass}
                    className="flex-1 bg-amber-50 py-4 rounded-xl border border-amber-200 mr-2 items-center justify-center flex-row"
                >
                    <AlertCircle size={18} color="#d97706" />
                    <Text className="text-amber-700 font-bold ml-2 text-sm">NO CLASS</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={handleSubmit}
                    disabled={submitting}
                    className={`flex-[2] bg-[#1a6fdb] py-4 rounded-xl items-center justify-center shadow-md ${submitting ? 'opacity-70' : 'opacity-100'}`}
                >
                    <Text className="text-white font-bold text-sm">
                        {submitting ? 'SUBMITTING...' : 'SUBMIT ATTENDANCE'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

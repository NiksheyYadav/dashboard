import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMyMentees, addCounsellingNote, Mentee } from '../../../lib/api-mentee';
import { ChevronLeft, CheckCircle2, AlertTriangle, BookOpen, MessageSquare, Send } from 'lucide-react-native';

export default function MenteeDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    
    const [mentee, setMentee] = useState<Mentee | null>(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadMentee = async () => {
            try {
                // In production, you'd fetch the single mentee by ID.
                // For mock, we fetch all and find the one.
                const data = await getMyMentees();
                const found = data.find(m => m.id === id);
                if (found) setMentee(found);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadMentee();
    }, [id]);

    const handleAddNote = async () => {
        if (!note.trim()) return;
        setSubmitting(true);
        try {
            await addCounsellingNote(id as string, note.trim());
            Alert.alert("Success", "Counselling note added successfully.");
            setNote('');
            // Optimistically update the UI to show the latest note date
            if (mentee) {
                setMentee({ ...mentee, lastCounsellingDate: new Date().toISOString().split('T')[0] });
            }
        } catch (e) {
            Alert.alert("Error", "Failed to add note.");
        } finally {
            setSubmitting(false);
        }
    };

    const getRiskColors = (percent: number) => {
        if (percent >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (percent >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (percent >= 65) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getStatusText = (percent: number) => {
        if (percent >= 85) return 'Good';
        if (percent >= 75) return 'Safe';
        if (percent >= 65) return 'Warning';
        return 'Critical';
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#f4f6fa] justify-center items-center">
                <ActivityIndicator size="large" color="#1a6fdb" />
            </SafeAreaView>
        );
    }

    if (!mentee) {
        return (
            <SafeAreaView className="flex-1 bg-[#f4f6fa] justify-center items-center">
                <Text className="text-gray-500">Mentee not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#f4f6fa]" edges={['top', 'bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Header */}
                <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                        <ChevronLeft size={24} color="#0a1628" />
                    </TouchableOpacity>
                    <View className="ml-2">
                        <Text className="text-gray-900 font-bold text-lg leading-tight">{mentee.name}</Text>
                        <Text className="text-gray-500 text-xs">{mentee.rollNo} • {mentee.batch}</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    
                    {/* Overall Summary Card */}
                    <View className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6 flex-row items-center justify-between">
                        <View>
                            <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Overall Attendance</Text>
                            <Text className={`text-4xl font-black ${getRiskColors(mentee.overallPercent).split(' ')[0]}`}>
                                {mentee.overallPercent}%
                            </Text>
                            <View className="flex-row items-center mt-1">
                                {mentee.overallPercent >= 75 ? (
                                    <CheckCircle2 size={14} color="#10b981" />
                                ) : (
                                    <AlertTriangle size={14} color={mentee.overallPercent >= 65 ? '#f59e0b' : '#ef4444'} />
                                )}
                                <Text className={`text-xs font-semibold ml-1 ${getRiskColors(mentee.overallPercent).split(' ')[0]}`}>
                                    {getStatusText(mentee.overallPercent)} Status
                                </Text>
                            </View>
                        </View>
                        
                        <View className="w-16 h-16 rounded-full bg-gray-50 border-4 border-gray-100 items-center justify-center">
                            <Text className="text-gray-900 font-bold text-lg">{mentee.name.charAt(0)}</Text>
                        </View>
                    </View>

                    {/* Subject Wise Table */}
                    <Text className="text-gray-900 font-bold text-lg mb-3">Subject-wise Breakdown</Text>
                    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                        <View className="flex-row border-b border-gray-100 bg-gray-50 p-3">
                            <Text className="flex-1 text-gray-500 text-[10px] font-bold uppercase">Subject</Text>
                            <Text className="w-16 text-right text-gray-500 text-[10px] font-bold uppercase">Att %</Text>
                            <Text className="w-20 text-right text-gray-500 text-[10px] font-bold uppercase">Status</Text>
                        </View>
                        {mentee.subjects.map((sub, idx) => (
                            <View key={sub.subjectCode} className={`flex-row p-3 items-center ${idx !== mentee.subjects.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                <View className="flex-1 pr-2">
                                    <Text className="text-gray-900 font-semibold text-sm">{sub.subjectName}</Text>
                                    <Text className="text-gray-400 text-xs">{sub.subjectCode}</Text>
                                </View>
                                <Text className="w-16 text-right font-black text-gray-900">{sub.attendancePercent}%</Text>
                                <View className="w-20 items-end">
                                    <View className={`px-2 py-0.5 rounded border ${getRiskColors(sub.attendancePercent)}`}>
                                        <Text className="text-[10px] font-bold">{getStatusText(sub.attendancePercent)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Counselling Note Form */}
                    <Text className="text-gray-900 font-bold text-lg mb-3">Add Counselling Note</Text>
                    <View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
                        {mentee.lastCounsellingDate && (
                            <Text className="text-gray-500 text-xs mb-3 font-medium">
                                Last counselled: <Text className="text-gray-900">{mentee.lastCounsellingDate}</Text>
                            </Text>
                        )}
                        <View className="bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 mb-3 min-h-[100px]">
                            <TextInput
                                multiline
                                placeholder="Log a discussion or reason for low attendance..."
                                placeholderTextColor="#9ca3af"
                                value={note}
                                onChangeText={setNote}
                                className="flex-1 text-gray-900 text-sm"
                                textAlignVertical="top"
                            />
                        </View>
                        <TouchableOpacity 
                            onPress={handleAddNote}
                            disabled={submitting || !note.trim()}
                            className={`flex-row items-center justify-center py-3.5 rounded-xl ${submitting || !note.trim() ? 'bg-blue-300' : 'bg-[#1a6fdb]'}`}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Send size={16} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-2">SAVE NOTE</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="h-10" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

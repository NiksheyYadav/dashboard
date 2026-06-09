import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getMyLeaves, getAvailableTeachers, applyForLeave, LeaveRequest, Teacher } from '../../../lib/api-leave';
import { Calendar, Plus, X, UserCheck, Send, Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react-native';
import { StunningLoader } from '../../../components/Loader';

export default function LeaveScreen() {
    const router = useRouter();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            const data = await getMyLeaves();
            setLeaves(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleOpenApply = async () => {
        try {
            setShowModal(true);
            const t = await getAvailableTeachers();
            setTeachers(t);
        } catch (e) {
            console.error('Failed to load available teachers:', e);
        }
    };

    const handleSubmit = async () => {
        if (!date || !reason || !selectedTeacher) {
            Alert.alert("Missing Fields", "Please fill out all fields.");
            return;
        }
        setSubmitting(true);
        try {
            await applyForLeave(date, reason, selectedTeacher);
            Alert.alert("Success", "Leave request submitted to HoD for approval.");
            setShowModal(false);
            setDate('');
            setReason('');
            setSelectedTeacher(null);
            loadData();
        } catch (error) {
            Alert.alert("Error", "Failed to submit leave.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'Approved': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2, color: '#059669' };
            case 'Rejected': return { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle, color: '#dc2626' };
            default: return { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock, color: '#d97706' };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#f4f6fa]" edges={['top']}>
            <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-100 shadow-sm z-10 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 bg-gray-50 rounded-full border border-gray-200">
                        <ArrowLeft size={18} color="#6b7280" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-gray-900 font-bold text-2xl tracking-tight">My Leaves</Text>
                        <Text className="text-gray-500 text-xs font-medium mt-0.5">Track your requests & arrangements</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleOpenApply} className="bg-[#1a6fdb] flex-row items-center px-3 py-2 rounded-xl shadow-sm shadow-blue-200">
                    <Plus size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-xs ml-1">APPLY</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <StunningLoader text="Loading Leaves..." />
                    </View>
                ) : leaves.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-4">
                        <Calendar size={48} color="#d1d5db" />
                        <Text className="text-gray-900 font-bold text-lg mt-4">No Leave History</Text>
                        <Text className="text-gray-500 text-center mt-2 text-sm">You haven't requested any leaves or class arrangements yet.</Text>
                    </View>
                ) : (
                    leaves.map((leave) => {
                        const style = getStatusUI(leave.status);
                        const Icon = style.icon;

                        return (
                            <View key={leave.id} className="bg-white rounded-2xl mb-4 border border-gray-200 shadow-sm p-4">
                                <View className="flex-row justify-between items-center mb-3">
                                    <View className="flex-row items-center">
                                        <Calendar size={16} color="#6b7280" />
                                        <Text className="text-gray-900 font-bold ml-2">{leave.date}</Text>
                                    </View>
                                    <View className={`flex-row items-center px-2.5 py-1 rounded-full ${style.bg}`}>
                                        <Icon size={12} color={style.color} />
                                        <Text className={`text-[10px] font-bold uppercase ml-1 ${style.text}`}>{leave.status}</Text>
                                    </View>
                                </View>
                                
                                <Text className="text-gray-600 text-sm mb-3">{leave.reason}</Text>
                                
                                <View className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex-row items-center">
                                    <UserCheck size={16} color="#1a6fdb" />
                                    <View className="ml-2">
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase">Arranged With</Text>
                                        <Text className="text-gray-900 font-semibold text-xs mt-0.5">{leave.arrangementTeacherName}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
                <View className="h-24" />
            </ScrollView>

            {/* Apply Leave Modal */}
            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView className="flex-1 bg-white">
                    <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center bg-gray-50/50">
                        <Text className="text-gray-900 font-bold text-lg">Apply for Leave</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full">
                            <X size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-6">
                        <Text className="text-gray-700 font-bold text-sm mb-2">Leave Date (YYYY-MM-DD)</Text>
                        <TextInput 
                            value={date}
                            onChangeText={setDate}
                            placeholder="e.g. 2026-06-20"
                            placeholderTextColor="#9ca3af"
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-900 text-base"
                        />

                        <Text className="text-gray-700 font-bold text-sm mb-2">Reason</Text>
                        <TextInput 
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Reason for leave"
                            placeholderTextColor="#9ca3af"
                            multiline
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 min-h-[100px] text-gray-900 text-base"
                            textAlignVertical="top"
                        />

                        <Text className="text-gray-700 font-bold text-sm mb-2">Select Arrangement Teacher</Text>
                        {teachers.map(t => (
                            <TouchableOpacity 
                                key={t.id}
                                onPress={() => setSelectedTeacher(t.id)}
                                className={`p-4 rounded-xl border mb-2 flex-row justify-between items-center ${selectedTeacher === t.id ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}
                            >
                                <View>
                                    <Text className={`font-bold ${selectedTeacher === t.id ? 'text-blue-700' : 'text-gray-900'}`}>{t.name}</Text>
                                    <Text className="text-gray-500 text-xs mt-0.5">{t.department}</Text>
                                </View>
                                {selectedTeacher === t.id && <CheckCircle2 size={20} color="#3b82f6" />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="p-4 border-t border-gray-100 bg-white">
                        <TouchableOpacity 
                            onPress={handleSubmit}
                            disabled={submitting}
                            className={`py-4 rounded-xl items-center flex-row justify-center ${submitting ? 'bg-blue-300' : 'bg-[#1a6fdb]'}`}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Send size={18} color="#fff" />
                                    <Text className="text-white font-bold ml-2">SUBMIT TO HOD</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

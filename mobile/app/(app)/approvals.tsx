import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getPendingApprovals, respondToLeave, LeaveRequest } from '../../lib/api-leave';
import { Check, X, Calendar, UserCheck, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { StunningLoader } from '../../components/Loader';

export default function ApprovalsScreen() {
    const router = useRouter();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const data = await getPendingApprovals();
            setRequests(data);
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

    const handleRespond = (id: string, approve: boolean) => {
        const action = approve ? "approve" : "reject";
        const doAction = async () => {
            try {
                await respondToLeave(id, approve);
                setRequests(current => current.filter(r => r.id !== id));
            } catch (e) {
                if (Platform.OS === 'web') {
                    window.alert('Failed to process request.');
                } else {
                    Alert.alert("Error", "Failed to process request.");
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to ${action} this request?`)) {
                doAction();
            }
        } else {
            Alert.alert(
                approve ? "Approve Request?" : "Reject Request?",
                "Are you sure you want to proceed?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Confirm", style: approve ? "default" : "destructive", onPress: doAction }
                ]
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#f4f6fa]" edges={['top']}>
            <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-100 shadow-sm z-10 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 bg-gray-50 rounded-full border border-gray-200">
                    <ArrowLeft size={18} color="#6b7280" />
                </TouchableOpacity>
                <View>
                    <Text className="text-gray-900 font-bold text-2xl tracking-tight">Pending Approvals</Text>
                    <Text className="text-gray-500 text-xs font-medium mt-0.5">Review leave and arrangement requests</Text>
                </View>
            </View>

            <ScrollView 
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <StunningLoader text="Loading Approvals..." />
                    </View>
                ) : requests.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-4">
                        <CheckCircle2 size={48} color="#10b981" />
                        <Text className="text-gray-900 font-bold text-lg mt-4">All Caught Up!</Text>
                        <Text className="text-gray-500 text-center mt-2 text-sm">There are no pending requests requiring your approval right now.</Text>
                    </View>
                ) : (
                    requests.map((req) => (
                        <View key={req.id} className="bg-white rounded-2xl mb-4 border border-gray-200 shadow-sm overflow-hidden">
                            <View className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1">Leave Request</Text>
                                <View className="flex-row items-center mb-2">
                                    <Calendar size={16} color="#6b7280" />
                                    <Text className="text-gray-900 font-bold ml-2 text-lg">{req.date}</Text>
                                </View>
                                <Text className="text-gray-600 text-sm leading-snug">{req.reason}</Text>
                            </View>
                            
                            <View className="p-4 bg-white flex-row items-center">
                                <UserCheck size={18} color="#1a6fdb" />
                                <View className="ml-3">
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase">Arranged Substitute</Text>
                                    <Text className="text-gray-900 font-semibold">{req.arrangementTeacherName}</Text>
                                </View>
                            </View>

                            <View className="flex-row border-t border-gray-100">
                                <TouchableOpacity 
                                    onPress={() => handleRespond(req.id, false)}
                                    className="flex-1 py-4 flex-row items-center justify-center border-r border-gray-100 bg-red-50/30"
                                >
                                    <X size={18} color="#ef4444" />
                                    <Text className="text-red-600 font-bold ml-2">REJECT</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleRespond(req.id, true)}
                                    className="flex-1 py-4 flex-row items-center justify-center bg-emerald-50/30"
                                >
                                    <Check size={18} color="#10b981" />
                                    <Text className="text-emerald-600 font-bold ml-2">APPROVE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View className="h-24" />
            </ScrollView>
        </SafeAreaView>
    );
}

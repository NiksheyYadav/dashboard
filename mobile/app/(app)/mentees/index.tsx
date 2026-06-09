import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getMyMentees, Mentee } from '../../../lib/api-mentee';
import { Users, AlertTriangle, CheckCircle2, ChevronRight, Search, ArrowLeft } from 'lucide-react-native';
import { StunningLoader } from '../../../components/Loader';

export default function MenteeListScreen() {
    const router = useRouter();
    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const data = await getMyMentees();
            setMentees(data);
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

    const getRiskColors = (risk: string) => {
        switch (risk) {
            case 'Safe': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2, iconColor: '#10b981' };
            case 'Warning': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle, iconColor: '#f59e0b' };
            case 'Critical': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle, iconColor: '#ef4444' };
            default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: Users, iconColor: '#6b7280' };
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
                        <Text className="text-gray-900 font-bold text-2xl tracking-tight">My Mentees</Text>
                        <Text className="text-gray-500 text-xs font-medium mt-0.5">Assigned to you for tracking</Text>
                    </View>
                </View>
                <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
                    <Search size={18} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <StunningLoader text="Loading Mentees..." />
                    </View>
                ) : mentees.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-4">
                        <Users size={48} color="#d1d5db" />
                        <Text className="text-gray-900 font-bold text-lg mt-4">No Mentees Assigned</Text>
                        <Text className="text-gray-500 text-center mt-2 text-sm">You currently have no students assigned to you for mentorship.</Text>
                    </View>
                ) : (
                    mentees.map((mentee) => {
                        const style = getRiskColors(mentee.riskStatus);
                        const Icon = style.icon;

                        return (
                            <TouchableOpacity 
                                key={mentee.id}
                                onPress={() => router.push(`/(app)/mentees/${mentee.id}`)}
                                className="bg-white rounded-2xl mb-4 border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <View className="flex-row justify-between items-center p-4">
                                    <View className="flex-row items-center flex-1 pr-4">
                                        <View className={`w-12 h-12 rounded-xl items-center justify-center border ${style.bg} ${style.border}`}>
                                            <Icon size={24} color={style.iconColor} />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-lg font-bold text-gray-900 leading-tight">{mentee.name}</Text>
                                            <Text className="text-gray-500 text-xs mt-0.5 font-medium">{mentee.rollNo} • {mentee.batch}</Text>
                                        </View>
                                    </View>
                                    
                                    <View className="items-end justify-center pl-4 border-l border-gray-100">
                                        <Text className={`text-xl font-extrabold ${style.text}`}>{mentee.overallPercent}%</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Overall</Text>
                                    </View>
                                </View>
                                
                                <View className={`px-4 py-2 flex-row justify-between items-center ${style.bg} border-t ${style.border}`}>
                                    <Text className={`text-[10px] font-bold uppercase ${style.text}`}>{mentee.riskStatus} STATUS</Text>
                                    <View className="flex-row items-center">
                                        <Text className={`text-[10px] font-semibold ${style.text} mr-1`}>View Details</Text>
                                        <ChevronRight size={12} color={style.iconColor} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
                <View className="h-24" />
            </ScrollView>
        </SafeAreaView>
    );
}

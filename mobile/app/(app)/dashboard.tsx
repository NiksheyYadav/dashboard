import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getTodaysTimetable, TimetableSlot } from '../../lib/api-attendance';
import { Clock, Users, BookOpen, ChevronRight, AlertCircle, LogOut, Database } from 'lucide-react-native';
import { StunningLoader } from '../../components/Loader';

export default function DashboardScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-[#f4f6fa] items-center justify-center">
                <StunningLoader text="Loading..." />
            </SafeAreaView>
        );
    }

    const loadData = async () => {
        try {
            const data = await getTodaysTimetable();
            setSlots(data);
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Extra': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Arrangement': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#f4f6fa]">
            <View className="px-6 pt-4 pb-2 bg-white border-b border-gray-100 shadow-sm z-10 flex-row justify-between items-center">
                <View>
                    <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">{user?.role} Dashboard</Text>
                    <Text className="text-xl font-bold text-[#0a1628] mt-0.5">{user?.full_name}</Text>
                </View>
                <TouchableOpacity onPress={logout} className="p-2 bg-gray-50 rounded-full border border-gray-200">
                    <LogOut size={18} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Quick Navigation Cards Grid */}
                <View className="flex-row flex-wrap justify-between mb-6 px-1">
                    {[
                        { label: "Mentorship", icon: Users, href: "/(app)/mentees", roles: ["Teacher", "Mentor", "HOD", "Dean"], primary: true },
                        { label: "My Leaves", icon: AlertCircle, href: "/(app)/leave", roles: ["Teacher", "HOD", "Dean"] },
                        { label: "Approvals", icon: BookOpen, href: "/(app)/approvals", roles: ["HOD", "Dean", "Admin"] },
                        { label: "Warning Letters", icon: AlertCircle, href: "#", roles: ["Teacher", "HOD", "Dean"] },
                        { label: "Extra Classes", icon: Clock, href: "#", roles: ["Teacher", "HOD", "Dean"] },
                        { label: "Activity Att.", icon: BookOpen, href: "#", roles: ["Activity_Coordinator", "HOD", "Dean"] },
                        { label: "Reports", icon: BookOpen, href: "#", roles: ["Dean", "HOD", "Teacher", "Activity_Coordinator", "Admin"] },
                        { label: "Master Data", icon: Database, href: "#", roles: ["Admin"] },
                        { label: "Staff Mgmt", icon: Users, href: "#", roles: ["Admin"] },
                        { label: "Policies", icon: AlertCircle, href: "#", roles: ["Admin"] },
                    ]
                    .filter(item => item.roles.map(r => r.toLowerCase()).includes(user?.role?.toLowerCase() || ''))
                    .map((item, index) => (
                        <TouchableOpacity 
                            key={index}
                            onPress={() => {
                                if (item.href === '#') {
                                    if (Platform.OS === 'web') {
                                        window.alert(`${item.label} is coming in Phase 5!`);
                                    } else {
                                        Alert.alert('Coming Soon', `${item.label} will be available in the next phase!`);
                                    }
                                } else {
                                    router.push(item.href as any);
                                }
                            }}
                            className={`w-[48%] p-4 rounded-2xl shadow-sm items-center justify-center border mb-3 ${item.primary ? 'bg-[#1a6fdb] border-blue-600' : 'bg-white border-gray-200'}`}
                            style={item.href === '#' ? { opacity: 0.7 } : {}}
                        >
                            <item.icon size={24} color={item.primary ? "#ffffff" : "#1a6fdb"} />
                            <Text className={`font-bold text-xs mt-2 text-center ${item.primary ? 'text-white' : 'text-gray-900'}`}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Role Specific Main Content */}
                {['teacher', 'hod'].includes(user?.role?.toLowerCase() || '') ? (
                    <>
                        <View className="flex-row justify-between items-end mb-4 px-2">
                            <Text className="text-lg font-extrabold text-gray-900">Today's Timetable</Text>
                            <Text className="text-sm font-semibold text-[#1a6fdb]">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                        </View>

                        {loading ? (
                            <View className="py-20 items-center justify-center">
                                <StunningLoader text="Loading Timetable..." />
                            </View>
                        ) : slots.length === 0 ? (
                            <View className="bg-white p-8 rounded-2xl border border-gray-200 items-center mt-4">
                                <Clock size={48} color="#d1d5db" />
                                <Text className="text-gray-900 font-bold text-lg mt-4">No Classes Today</Text>
                                <Text className="text-gray-500 text-center mt-2 text-sm">You have no assigned lectures or arrangements for today.</Text>
                            </View>
                        ) : (
                            slots.map((slot) => (
                                <TouchableOpacity 
                                    key={slot.id}
                                    onPress={() => router.push(`/(app)/attendance/${slot.id}`)}
                                    disabled={slot.status === 'Completed'}
                                    className={`bg-white rounded-2xl mb-4 border overflow-hidden ${slot.status === 'Completed' ? 'border-gray-200 opacity-60' : 'border-gray-200 shadow-sm'}`}
                                >
                                    {/* Card Header */}
                                    <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <View className="flex-row items-center">
                                            <Clock size={14} color="#6b7280" />
                                            <Text className="text-gray-600 font-semibold text-xs ml-1.5">{slot.time}</Text>
                                        </View>
                                        <View className={`px-2.5 py-0.5 rounded border ${getTypeColor(slot.classType)}`}>
                                            <Text className="text-[10px] font-bold uppercase">{slot.classType}</Text>
                                        </View>
                                    </View>

                                    {/* Card Body */}
                                    <View className="p-4 flex-row justify-between items-center">
                                        <View className="flex-1 pr-4">
                                            <Text className="text-lg font-bold text-gray-900 leading-tight">{slot.subjectName}</Text>
                                            <Text className="text-gray-500 text-xs mt-1 font-medium">{slot.subjectCode} • {slot.programme}</Text>
                                            
                                            <View className="flex-row items-center mt-3">
                                                <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded">
                                                    <Users size={12} color="#6b7280" />
                                                    <Text className="text-gray-600 text-[10px] font-bold ml-1">{slot.section}</Text>
                                                </View>
                                                <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded ml-2">
                                                    <BookOpen size={12} color="#6b7280" />
                                                    <Text className="text-gray-600 text-[10px] font-bold ml-1">{slot.totalStudents} Students</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Action Area */}
                                        <View className="items-center justify-center pl-2 border-l border-gray-100">
                                            {slot.status === 'Completed' ? (
                                                <View className="items-center justify-center w-12 h-12 bg-emerald-50 rounded-full border border-emerald-100">
                                                    <Text className="text-emerald-600 font-bold text-[10px]">DONE</Text>
                                                </View>
                                            ) : (
                                                <View className="items-center justify-center w-12 h-12 bg-[#1a6fdb] rounded-full shadow-sm shadow-blue-200">
                                                    <ChevronRight size={24} color="#ffffff" />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </>
                ) : null}
                
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}

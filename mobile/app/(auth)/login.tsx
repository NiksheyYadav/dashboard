import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Shield, Crown, Briefcase, BookOpen, UserCog, Eye, EyeOff } from 'lucide-react-native';

type UserRole = "admin" | "dean" | "hod" | "teacher" | "activity_coordinator";

const ROLE_OPTIONS = [
    { key: "admin" as UserRole, label: "Admin", Icon: Shield },
    { key: "dean" as UserRole, label: "Dean", Icon: Crown },
    { key: "hod" as UserRole, label: "HOD", Icon: Briefcase },
    { key: "teacher" as UserRole, label: "Teacher", Icon: BookOpen },
    { key: "activity_coordinator" as UserRole, label: "Coord.", Icon: UserCog },
];

const DEMO_ACCOUNTS = [
    { role: "admin" as UserRole, name: "System Admin", subtitle: "Administration", email: "admin@sgtuniversity.org", Icon: Shield, iconBg: "bg-indigo-50", iconColor: "#6366f1" },
    { role: "dean" as UserRole, name: "Prof. Rajesh Gupta", subtitle: "Dean", email: "dean@sgtuniversity.org", Icon: Crown, iconBg: "bg-amber-50", iconColor: "#f59e0b" },
    { role: "hod" as UserRole, name: "Dr. Priya Mehta", subtitle: "HOD — B.Tech CS", email: "hod@sgtuniversity.org", Icon: Briefcase, iconBg: "bg-blue-50", iconColor: "#3b82f6" },
    { role: "teacher" as UserRole, name: "Dr. Amit Sharma", subtitle: "Teacher", email: "teacher@sgtuniversity.org", Icon: BookOpen, iconBg: "bg-emerald-50", iconColor: "#10b981" },
];

export default function LoginScreen() {
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const [selectedRole, setSelectedRole] = useState<UserRole>("teacher");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            // Mock API authentication
            const demoAccount = DEMO_ACCOUNTS.find(a => a.role === selectedRole);
            const userObj = {
                id: 'demo-123',
                email: email,
                full_name: demoAccount?.name || 'User',
                role: selectedRole,
            };
            
            await login('mock-jwt-token', userObj);
        } catch (err: any) {
            setError(err.message || 'An error occurred during login.');
        }
    };

    const handleDemoLogin = async (role: UserRole, demoEmail: string) => {
        setSelectedRole(role);
        setEmail(demoEmail);
        setPassword('password');
        setError('');
        // Auto-login with demo credentials
        try {
            const demoAccount = DEMO_ACCOUNTS.find(a => a.role === role);
            const userObj = {
                id: `demo-${role}`,
                email: demoEmail,
                full_name: demoAccount?.name || 'User',
                role: role,
            };
            await login('mock-jwt-token', userObj);
        } catch (err: any) {
            setError(err.message || 'Demo login failed.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#f4f6fa]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Header */}
                    <View className="items-center mb-8 mt-4">
                        <View className="w-16 h-16 bg-[#0a1628] rounded-2xl items-center justify-center mb-3 shadow-sm">
                            <Text className="text-[#1a6fdb] text-2xl font-bold tracking-tighter">EP</Text>
                        </View>
                        <Text className="text-gray-900 text-2xl font-bold tracking-tight">Welcome back</Text>
                        <Text className="text-gray-500 mt-1 text-sm text-center">
                            Sign in with your {ROLE_OPTIONS.find(r => r.key === selectedRole)?.label} credentials
                        </Text>
                    </View>

                    {/* Role Selector Tabs */}
                    <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6 border border-gray-200">
                        {ROLE_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setSelectedRole(opt.key)}
                                className={`flex-1 items-center py-2 rounded-lg ${selectedRole === opt.key ? 'bg-[#1a6fdb] shadow-sm' : 'bg-transparent'}`}
                            >
                                <opt.Icon size={16} color={selectedRole === opt.key ? '#fff' : '#6b7280'} />
                                <Text className={`text-[10px] font-bold mt-1 ${selectedRole === opt.key ? 'text-white' : 'text-gray-500'}`}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Form */}
                    <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                        <View className="mb-4">
                            <Text className="text-gray-700 text-xs font-semibold mb-1.5 ml-1">Email</Text>
                            <TextInput
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-[#1a6fdb]"
                                placeholder={`${selectedRole}@sgtuniversity.org`}
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="mb-2">
                            <Text className="text-gray-700 text-xs font-semibold mb-1.5 ml-1">Password</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-gray-900 text-sm focus:border-[#1a6fdb]"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity 
                                    className="absolute right-4" 
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="items-end mb-6">
                            <TouchableOpacity>
                                <Text className="text-[#1a6fdb] text-xs font-semibold">Forgot password?</Text>
                            </TouchableOpacity>
                        </View>

                        {error ? <Text className="text-red-500 text-sm text-center mb-4">{error}</Text> : null}

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            className={`w-full bg-[#1a6fdb] py-3.5 rounded-xl items-center shadow-md ${isLoading ? 'opacity-70' : 'opacity-100'}`}
                        >
                            <Text className="text-white font-bold text-sm">
                                {isLoading ? 'Signing in...' : `Sign In as ${ROLE_OPTIONS.find(r => r.key === selectedRole)?.label}`}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Demo Accounts List */}
                    <View className="flex-row items-center mb-4">
                        <View className="flex-1 h-[1px] bg-gray-200" />
                        <Text className="text-xs text-gray-400 mx-3">Demo Accounts</Text>
                        <View className="flex-1 h-[1px] bg-gray-200" />
                    </View>

                    <View className="gap-y-2">
                        {DEMO_ACCOUNTS.map((account) => (
                            <TouchableOpacity
                                key={account.role}
                                onPress={() => handleDemoLogin(account.role, account.email)}
                                className="flex-row items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm"
                            >
                                <View className={`w-10 h-10 ${account.iconBg} rounded-lg items-center justify-center mr-3`}>
                                    <account.Icon size={20} color={account.iconColor} />
                                </View>
                                <View>
                                    <Text className="text-gray-900 text-sm font-semibold">{account.name}</Text>
                                    <Text className="text-gray-400 text-xs mt-0.5">{account.subtitle}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

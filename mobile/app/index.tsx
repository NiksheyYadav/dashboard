import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6fa' }}>
                <ActivityIndicator size="large" color="#1a6fdb" />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(app)/dashboard" />;
    }

    return <Redirect href="/(auth)/login" />;
}

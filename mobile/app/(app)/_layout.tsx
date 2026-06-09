import { Stack } from 'expo-router';

export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="mentees/index" />
            <Stack.Screen name="mentees/[id]" />
            <Stack.Screen name="leave/index" />
            <Stack.Screen name="approvals" />
            <Stack.Screen name="attendance/[id]" />
        </Stack>
    );
}

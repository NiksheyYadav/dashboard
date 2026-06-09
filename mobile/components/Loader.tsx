import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withSequence, 
    Easing,
    withDelay
} from 'react-native-reanimated';

interface LoaderProps {
    text?: string;
}

export function StunningLoader({ text = "Loading..." }: LoaderProps) {
    const rotation = useSharedValue(0);
    const scale1 = useSharedValue(1);
    const scale2 = useSharedValue(1);
    const scale3 = useSharedValue(1);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 3000, easing: Easing.linear }),
            -1,
            false
        );

        const createPulse = () => withSequence(
            withTiming(1.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        );

        scale1.value = withRepeat(createPulse(), -1, true);
        scale2.value = withDelay(400, withRepeat(createPulse(), -1, true));
        scale3.value = withDelay(800, withRepeat(createPulse(), -1, true));
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
                { scale: scale1.value },
                { translateY: -15 }
            ],
        };
    });

    const animatedStyle2 = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${-rotation.value * 1.5}deg` },
                { scale: scale2.value },
                { translateX: 15 },
                { translateY: 10 }
            ],
        };
    });

    const animatedStyle3 = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value * 2}deg` },
                { scale: scale3.value },
                { translateX: -15 },
                { translateY: 10 }
            ],
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.animationContainer}>
                {/* Center Core */}
                <View style={styles.core} />
                
                {/* Orbiting Elements */}
                <Animated.View style={[styles.orbit, styles.orbit1, animatedStyle1]} />
                <Animated.View style={[styles.orbit, styles.orbit2, animatedStyle2]} />
                <Animated.View style={[styles.orbit, styles.orbit3, animatedStyle3]} />
            </View>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    animationContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    core: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#1a6fdb',
        position: 'absolute',
        shadowColor: '#1a6fdb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    orbit: {
        width: 24,
        height: 24,
        borderRadius: 6,
        position: 'absolute',
        borderWidth: 2,
    },
    orbit1: {
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    orbit2: {
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderRadius: 12,
    },
    orbit3: {
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        transform: [{ rotate: '45deg' }],
    },
    text: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    }
});

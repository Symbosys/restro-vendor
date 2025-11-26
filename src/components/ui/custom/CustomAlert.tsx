import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import useAlertStore from '../../../store/useAlertStore';
import { RootStackParamList } from '../../../types/types';

const { width } = Dimensions.get('window');

// --- 1. Custom Drawn Icons (No external libraries required) ---
const IconRenderer = ({ type, color }: { type: string; color: string }) => {
    if (type === 'success') {
        return (
            <View style={styles.iconShape}>
                <View style={[styles.checkMark, { borderColor: color }]} />
            </View>
        );
    }
    if (type === 'error') {
        return (
            <View style={styles.iconShape}>
                <View
                    style={[
                        styles.crossLine,
                        { backgroundColor: color, transform: [{ rotate: '45deg' }] },
                    ]}
                />
                <View
                    style={[
                        styles.crossLine,
                        { backgroundColor: color, transform: [{ rotate: '-45deg' }] },
                    ]}
                />
            </View>
        );
    }
    return (
        <View style={styles.iconShape}>
            <View style={[styles.infoDot, { backgroundColor: color }]} />
            <View style={[styles.infoLine, { backgroundColor: color }]} />
        </View>
    );
};

const CustomAlert = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { visible, title, message, type, navigateTo, hideAlert } = useAlertStore();
    const [showModal, setShowModal] = useState(visible);

    // Animation Values
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            // Entry Animation: Spring Scale + Fade In
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 6, // Bounciness
                    tension: 40, // Speed
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Exit Animation: Scale Down + Fade Out
            Animated.parallel([
                Animated.timing(scaleValue, {
                    toValue: 0.8,
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => setShowModal(false));
        }
    }, [visible]);

    // --- Color & Style Configuration ---
    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    primary: '#10B981', // Emerald
                    bg: '#ECFDF5',
                    btnText: '#FFFFFF',
                    title: 'Success!',
                };
            case 'error':
                return {
                    primary: '#EF4444', // Rose
                    bg: '#FEF2F2',
                    btnText: '#FFFFFF',
                    title: 'Error!',
                };
            case 'info':
            default:
                return {
                    primary: '#3B82F6', // Blue
                    bg: '#EFF6FF',
                    btnText: '#FFFFFF',
                    title: 'Note',
                };
        }
    };

    const config = getConfig();

    const handleDismiss = () => {
        hideAlert();
        if (navigateTo) {
            navigation.navigate(navigateTo as any);
        }
    };

    if (!showModal) return null;

    return (
        <Modal
            transparent={true}
            visible={showModal}
            animationType="none" // We handle animation manually
            onRequestClose={handleDismiss}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Backdrop Dimming */}
                <Animated.View style={[styles.backdrop, { opacity: opacityValue }]} />
                {/* Main Alert Card */}
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            transform: [{ scale: scaleValue }],
                            opacity: opacityValue,
                        },
                    ]}
                >
                    {/* Top Acccent Line */}
                    <View style={[styles.accentLine, { backgroundColor: config.primary }]} />
                    {/* Icon Container with Glow Effect */}
                    <View style={[styles.iconOuterCircle, { backgroundColor: config.bg }]}>
                        <View
                            style={[styles.iconInnerCircle, { backgroundColor: config.primary + '20' }]}
                        >
                            {/* +20 adds transparency to hex */}
                            <IconRenderer type={type} color={config.primary} />
                        </View>
                    </View>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{title || config.title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                    {/* Modern Full-Width Button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.button, { backgroundColor: config.primary, shadowColor: config.primary }]}
                        onPress={handleDismiss}
                    >
                        <Text style={[styles.buttonText, { color: config.btnText }]}>
                            Okay, Got it
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.65)', // Darker, more premium backdrop
    },
    alertContainer: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 30, // Super rounded corners
        paddingTop: 0,
        paddingBottom: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
        // Premium Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    accentLine: {
        width: 60,
        height: 4,
        borderRadius: 2,
        marginTop: 12,
        marginBottom: 20,
        opacity: 0.3,
    },
    iconOuterCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconInnerCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        marginBottom: 28,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '800', // Extra bold
        color: '#111827',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '800',
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        // Button Shadow (Glow)
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    // --- Icon Drawings ---
    iconShape: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkMark: {
        width: 16,
        height: 28,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        marginBottom: 4,
        transform: [{ rotate: '45deg' }],
    },
    crossLine: {
        position: 'absolute',
        width: 4,
        height: 28,
        borderRadius: 2,
    },
    infoDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginBottom: 4,
    },
    infoLine: {
        width: 5,
        height: 18,
        borderRadius: 2.5,
    },
});

export default CustomAlert;
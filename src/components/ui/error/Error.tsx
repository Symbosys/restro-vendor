import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { AxiosError } from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../theme/color';

const ErrorComponent = ({
    error,
    onRefresh
}: {
    error: Error | AxiosError;
    onRefresh?: () => void
}) => {
    const message = error instanceof AxiosError
        ? error.response?.data?.message || error.message || 'Something went wrong'
        : error.message || 'An unexpected error occurred';

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Top Accent Bar */}
                <View style={styles.gradientBar} />

                {/* Warning Icon (Vector) */}
                <Icon name="warning-amber" size={80} color={COLORS.primary} style={styles.icon} />

                {/* Title */}
                <Text style={styles.title}>Oops! Something Went Wrong</Text>

                {/* Error Message */}
                <Text style={styles.message}>{message}</Text>

                {/* Refresh Button with Vector Icon */}
                <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} activeOpacity={0.85}>
                    <Icon name="refresh" size={28} color={COLORS.white} />
                    <Text style={styles.refreshText}>Try Again</Text>
                </TouchableOpacity>

                <Text style={styles.hint}>Tap the button to reload</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
        elevation: 24,
        maxWidth: 400,
        width: '100%',
        borderWidth: 1.5,
        borderColor: '#e8d8ff',
    },
    gradientBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 7,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 36,
        borderRadius: 50,
        gap: 14,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 15,
    },
    refreshText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },
    hint: {
        marginTop: 24,
        fontSize: 14,
        color: COLORS.muted,
        fontWeight: '800',
    },
});

export default ErrorComponent;
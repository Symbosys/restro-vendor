import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

const { width: screenWidth } = Dimensions.get('window');
const maxWidth = Math.min(screenWidth - 32, 400);

export default function PackingOrderConfirmedScreen({navigation}: AppNavigation) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.emptyCenter} />
                    <View style={styles.emptyRight} />
                </View>

                {/* Main Content */}
                <View style={styles.main}>
                    {/* Success Icon */}
                    <View style={styles.successIcon}>
                        <MaterialIcons name="check-circle" size={80} color="#10B981" />
                    </View>

                    {/* Headline */}
                    <Text style={styles.headline}>Order Confirmed! 🎉</Text>

                    {/* Body Text */}
                    <Text style={styles.bodyText}>
                        Your packing materials order has been placed successfully!
                    </Text>

                    {/* Details Card */}
                    <View style={[styles.detailsCard, { width: maxWidth }]}>
                        {/* Order Summary */}
                        <View>
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                            <View style={styles.summaryRows}>
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>Order ID</Text>
                                    <Text style={styles.rowValue}>#PACK-2023-001</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>Total Order Amount</Text>
                                    <Text style={styles.rowValue}>₹870</Text>
                                </View>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Installment Details */}
                        <View>
                            <Text style={styles.sectionTitle}>Installment Plan</Text>
                            <View style={styles.installmentContent}>
                                <Text style={styles.installmentText}>
                                    Payment will be deducted from your Wallet.
                                </Text>
                                <Text style={styles.installmentText}>
                                    Total amount of <Text style={styles.strongText}>₹870</Text> will be cut in{' '}
                                    <Text style={styles.strongText}>3 weekly installments of ₹290</Text>.
                                </Text>
                                <Text style={styles.installmentText}>
                                    You will receive a notification each week before deduction.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={[styles.actionButtons, { width: maxWidth }]}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.accent]}
                            style={styles.primaryButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.primaryButtonText}>View Order Details</Text>
                        </LinearGradient>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    emptyCenter: {
        flex: 1,
    },
    emptyRight: {
        width: 48,
    },
    main: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    headline: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    bodyText: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 280,
    },
    detailsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        gap: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    summaryRows: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 24,
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#7A6388',
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'right',
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    installmentContent: {
        gap: 16,
    },
    installmentText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#7A6388',
        lineHeight: 20,
    },
    strongText: {
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    actionButtons: {
        marginTop: 40,
        gap: 16,
        width: '100%',
    },
    primaryButton: {
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
    },
});
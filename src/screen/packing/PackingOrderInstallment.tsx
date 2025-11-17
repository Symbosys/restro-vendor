import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';

const { width: screenWidth } = Dimensions.get('window');

export default function InstallmentDetailsScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Installment Details</Text>
                </View>

                {/* Subtitle */}
                <Text style={styles.subtitle}>For Order #PKG-2025-014</Text>

                {/* Scrollable Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Installment Breakdown */}
                    <View style={styles.breakdownSection}>
                        <Text style={styles.sectionTitle}>Installment Breakdown</Text>
                        <View style={styles.timeline}>
                            <View style={styles.verticalLine} />
                            {/* Installment 1 */}
                            <View style={styles.installmentItem}>
                                <View style={[styles.iconCircle, styles.paidIcon]}>
                                    <MaterialIcons name="check" size={24} color={COLORS.white} />
                                </View>
                                <View style={styles.installmentCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.installmentLabel}>Installment 1 of 3</Text>
                                        <Text style={styles.installmentAmount}>₹290</Text>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View style={[styles.statusBadge, styles.paidBadge]}>
                                            <MaterialIcons name="check-circle" size={16} color="#28A745" />
                                            <Text style={[styles.statusText, { color: '#28A745' }]}>Paid</Text>
                                        </View>
                                        <Text style={styles.dateText}>Jan 15, 2024</Text>
                                    </View>
                                </View>
                            </View>
                            {/* Installment 2 */}
                            <View style={styles.installmentItem}>
                                <View style={[styles.iconCircle, styles.pendingIcon]}>
                                    <MaterialIcons name="schedule" size={24} color={COLORS.white} />
                                </View>
                                <View style={[styles.installmentCard, styles.pendingCard]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.installmentLabel}>Installment 2 of 3</Text>
                                        <Text style={styles.installmentAmount}>₹290</Text>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View style={[styles.statusBadge, styles.pendingBadge]}>
                                            <MaterialIcons name="hourglass-top" size={16} color="#FFC107" />
                                            <Text style={[styles.statusText, { color: '#FFC107' }]}>Pending</Text>
                                        </View>
                                        <Text style={styles.dateText}>Due: Jan 22, 2024</Text>
                                    </View>
                                    <TouchableOpacity style={styles.payButton}>
                                        <Text style={styles.payButtonText}>Pay Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* Installment 3 */}
                            <View style={styles.installmentItem}>
                                <View style={[styles.iconCircle, styles.upcomingIcon]}>
                                    <MaterialIcons name="more-horiz" size={24} color="#9CA3AF" />
                                </View>
                                <View style={styles.installmentCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.installmentLabel}>Installment 3 of 3</Text>
                                        <Text style={styles.installmentAmount}>₹290</Text>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View style={[styles.statusBadge, styles.upcomingBadge]}>
                                            <MaterialIcons name="lock-clock" size={16} color="#6C757D" />
                                            <Text style={[styles.statusText, { color: '#6C757D' }]}>Upcoming</Text>
                                        </View>
                                        <Text style={styles.dateText}>Due: Jan 29, 2024</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Payment Summary */}
                    <View style={styles.summarySection}>
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Payable</Text>
                                <Text style={styles.summaryValue}>₹870</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Amount Paid</Text>
                                <Text style={[styles.summaryValue, styles.paidValue]}>₹290</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Pending Balance</Text>
                                <Text style={[styles.summaryValue, styles.pendingValue]}>₹580</Text>
                            </View>
                            <View style={styles.dashedDivider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Next Due Date</Text>
                                <Text style={styles.summaryValue}>Jan 22, 2024</Text>
                            </View>
                        </View>
                    </View>

                    {/* Payment History */}
                    <View style={styles.historySection}>
                        <Text style={styles.sectionTitle}>Payment History</Text>
                        <View style={styles.historyItem}>
                            <View style={[styles.historyIcon, styles.historyPaidIcon]}>
                                <MaterialIcons name="receipt-long" size={24} color="#28A745" />
                            </View>
                            <View style={styles.historyDetails}>
                                <View style={styles.historyHeader}>
                                    <Text style={styles.historyLabel}>Installment 1 of 3</Text>
                                    <Text style={[styles.historyAmount, styles.historyPaidAmount]}>+ ₹290</Text>
                                </View>
                                <View style={styles.historyFooter}>
                                    <Text style={styles.historyDate}>Jan 15, 2024</Text>
                                    <Text style={styles.historyMethod}>Wallet Debit</Text>
                                </View>
                                <Text style={styles.historyRef}>Ref: #TRX-98765</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
        marginLeft: -48,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.muted,
        textAlign: 'center',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    breakdownSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    timeline: {
        position: 'relative',
    },
    verticalLine: {
        position: 'absolute',
        left: 20,
        top: 8,
        bottom: 8,
        width: 1,
        backgroundColor: '#E5E7EB',
    },
    installmentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 16,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paidIcon: {
        backgroundColor: '#28A745',
    },
    pendingIcon: {
        backgroundColor: COLORS.primary,
    },
    upcomingIcon: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        backgroundColor: COLORS.background,
    },
    installmentCard: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: COLORS.white,
        overflow: 'hidden',
    },
    pendingCard: {
        borderColor: `${COLORS.primary}50`,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    installmentLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    installmentAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    statusBadge: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    paidBadge: {
        backgroundColor: '#28A74520',
    },
    pendingBadge: {
        backgroundColor: '#FFC10720',
    },
    upcomingBadge: {
        backgroundColor: '#6C757D20',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: COLORS.muted,
    },
    payButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
    },
    summarySection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.muted,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    paidValue: {
        color: '#28A745',
    },
    pendingValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFC107',
    },
    dashedDivider: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        borderStyle: 'dashed',
        marginVertical: 12,
    },
    historySection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    historyIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyPaidIcon: {
        backgroundColor: '#28A74520',
    },
    historyDetails: {
        flex: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    historyLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    historyAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    historyPaidAmount: {
        color: '#28A745',
    },
    historyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
        color: COLORS.muted,
    },
    historyMethod: {
        fontSize: 12,
        color: COLORS.muted,
    },
    historyRef: {
        fontSize: 10,
        color: `${COLORS.muted}80`,
    },
});
import React, { useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { usePackingInstallmentsSummary, usePackingInstallmentPlans } from '../../api/hooks/packing_items';
import { PackingInstallment, PackingInstallmentPlan } from '../../services/packing.service';
import { RouteProp, useRoute } from '@react-navigation/native';
import { parseToDecimal } from '../../utils/utils';

type RouteParams = {
    params: {
        orderId?: string;
        planId?: string;
    };
};

const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
        PAID: { icon: 'check', color: '#28A745', bgColor: '#28A74520', label: 'Paid' },
        PENDING: { icon: 'hourglass-top', color: '#FFC107', bgColor: '#FFC10720', label: 'Pending' },
        UPCOMING: { icon: 'schedule', color: '#3B82F6', bgColor: '#3B82F620', label: 'Upcoming' },
        DUE: { icon: 'notification-important', color: '#F59E0B', bgColor: '#F59E0B20', label: 'Due Now' },
        OVERDUE: { icon: 'warning', color: '#EF4444', bgColor: '#EF444420', label: 'Overdue' },
        PROCESSING: { icon: 'sync', color: '#8B5CF6', bgColor: '#8B5CF620', label: 'Processing' },
        FAILED: { icon: 'error', color: '#EF4444', bgColor: '#EF444420', label: 'Failed' },
        CANCELLED: { icon: 'cancel', color: '#6C757D', bgColor: '#6C757D20', label: 'Cancelled' },
    };
    return configs[status] || configs.PENDING;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function InstallmentDetailsScreen({ navigation }: AppNavigation) {
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    const orderId = route.params?.orderId;

    const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary, isRefetching: summaryRefetching } = usePackingInstallmentsSummary();
    const { data: plansData, isLoading: plansLoading, refetch: refetchPlans, isRefetching: plansRefetching } = usePackingInstallmentPlans({
        isCompleted: false,
        isCancelled: false,
    });

    const isLoading = summaryLoading || plansLoading;
    const isRefetching = summaryRefetching || plansRefetching;

    const handleRefresh = () => {
        refetchSummary();
        refetchPlans();
    };

    const activePlans: PackingInstallmentPlan[] = plansData?.plans || [];
    const summary = summaryData?.summary;
    const upcomingInstallments = summaryData?.upcomingInstallments || [];
    const dueInstallments = summaryData?.dueInstallments || [];

    // If orderId is provided, filter to show only that order's plan
    const displayPlans = useMemo(() => {
        if (orderId && activePlans.length > 0) {
            return activePlans.filter(plan => plan.orderId === orderId);
        }
        return activePlans;
    }, [activePlans, orderId]);

    const renderInstallmentTimeline = (installments: PackingInstallment[]) => {
        return installments.map((installment, index) => {
            const config = getStatusConfig(installment.status);
            const isLast = index === installments.length - 1;
            const isPaid = installment.status === 'PAID';
            const isDue = installment.status === 'DUE';

            return (
                <View key={installment.id} style={styles.installmentItem}>
                    <View style={styles.timelineLeft}>
                        <View style={[styles.iconCircle, { backgroundColor: isPaid ? config.color : config.bgColor }]}>
                            <MaterialIcons
                                name={config.icon as any}
                                size={20}
                                color={isPaid ? COLORS.white : config.color}
                            />
                        </View>
                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: isPaid ? config.color : '#E5E7EB' }]} />}
                    </View>
                    <View style={[styles.installmentCard, isDue && styles.installmentCardHighlight]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.installmentLabel}>
                                Installment {installment.installmentNumber} of 3
                            </Text>
                            <Text style={styles.installmentAmount}>₹{Number(installment.amount).toFixed(0)}</Text>
                        </View>
                        <View style={styles.cardFooter}>
                            <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                                <MaterialIcons name={config.icon as any} size={14} color={config.color} />
                                <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                            </View>
                            <Text style={styles.dateText}>
                                {installment.paidDate
                                    ? formatDate(installment.paidDate)
                                    : `Due: ${formatDate(installment.dueDate)}`}
                            </Text>
                        </View>
                        {(isDue || installment.status === 'OVERDUE') && (
                            <TouchableOpacity style={styles.payButton}>
                                <Text style={styles.payButtonText}>Pay Now</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Installment Details</Text>
                </View>

                {/* Loading State */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading installments...</Text>
                    </View>
                )}

                {/* Main Content */}
                {!isLoading && (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={handleRefresh}
                                colors={[COLORS.primary]}
                            />
                        }
                    >
                        {/* Summary Card */}
                        {summary && (
                            <View style={styles.summaryCard}>
                                <Text style={styles.sectionTitle}>Payment Summary</Text>
                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{summary.plans.active}</Text>
                                        <Text style={styles.summaryLabel}>Active Plans</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{summary.installments.paid}</Text>
                                        <Text style={styles.summaryLabel}>Paid</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={[styles.summaryValue, summary.installments.overdue > 0 && styles.overdueValue]}>
                                            {summary.installments.overdue}
                                        </Text>
                                        <Text style={styles.summaryLabel}>Overdue</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={[styles.summaryValue, styles.pendingValue]}>
                                            ₹{parseToDecimal(summary.pendingAmount).toFixed(0)}
                                        </Text>
                                        <Text style={styles.summaryLabel}>Pending</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Due Now Section */}
                        {dueInstallments.length > 0 && (
                            <View style={styles.alertSection}>
                                <View style={styles.alertHeader}>
                                    <MaterialIcons name="notification-important" size={24} color="#F59E0B" />
                                    <Text style={styles.alertTitle}>Due Now ({dueInstallments.length})</Text>
                                </View>
                                {dueInstallments.map((installment) => (
                                    <View key={installment.id} style={styles.alertCard}>
                                        <Text style={styles.alertAmount}>₹{parseToDecimal(installment.amount as any).toFixed(0)}</Text>
                                        <Text style={styles.alertDate}>Due: {formatDate(installment.dueDate)}</Text>
                                        <TouchableOpacity style={styles.alertPayButton}>
                                            <Text style={styles.alertPayButtonText}>Pay Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Active Plans */}
                        {displayPlans.map((plan) => (
                            <View key={plan.id} style={styles.planSection}>
                                <View style={styles.planHeader}>
                                    <Text style={styles.sectionTitle}>Order #{plan.order?.orderNumber || plan.orderId}</Text>
                                    <View style={styles.planProgress}>
                                        <Text style={styles.progressText}>
                                            {plan.paidInstallments}/{plan.installmentCount} paid
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.planSummary}>
                                    <View style={styles.planRow}>
                                        <Text style={styles.planLabel}>Total Amount</Text>
                                        <Text style={styles.planValue}>₹{Number(plan.totalAmount).toFixed(0)}</Text>
                                    </View>
                                    <View style={styles.planRow}>
                                        <Text style={styles.planLabel}>Remaining</Text>
                                        <Text style={[styles.planValue, styles.remainingValue]}>
                                            ₹{Number(plan.remainingAmount).toFixed(0)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.timeline}>
                                    {renderInstallmentTimeline(plan.installments)}
                                </View>
                            </View>
                        ))}

                        {/* Empty State */}
                        {displayPlans.length === 0 && !isLoading && (
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="payments" size={48} color={COLORS.muted} />
                                <Text style={styles.emptyText}>No active installment plans</Text>
                                <Text style={styles.emptySubtext}>All your installments are up to date!</Text>
                            </View>
                        )}
                    </ScrollView>
                )}
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
        backgroundColor: COLORS.white,
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.muted,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 4,
    },
    overdueValue: {
        color: '#EF4444',
    },
    pendingValue: {
        color: '#F59E0B',
        fontSize: 18,
    },
    alertSection: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#92400E',
    },
    alertCard: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    alertAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    alertDate: {
        fontSize: 12,
        color: COLORS.muted,
    },
    alertPayButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    alertPayButtonText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.white,
    },
    planSection: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    planProgress: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
    },
    planSummary: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 12,
        marginBottom: 16,
        gap: 8,
    },
    planRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    planLabel: {
        fontSize: 14,
        color: COLORS.muted,
    },
    planValue: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    remainingValue: {
        color: '#F59E0B',
    },
    timeline: {
        position: 'relative',
    },
    installmentItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 40,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginTop: 4,
    },
    installmentCard: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: COLORS.white,
        overflow: 'hidden',
    },
    installmentCardHighlight: {
        borderColor: COLORS.primary + '50',
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
        padding: 12,
    },
    installmentLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    installmentAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    dateText: {
        fontSize: 11,
        color: COLORS.muted,
    },
    payButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.white,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
    },
});
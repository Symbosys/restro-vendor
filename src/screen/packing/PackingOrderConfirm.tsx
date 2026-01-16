import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { usePackingCart, useCreatePackingOrder } from '../../api/query/packing_items';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');
const maxWidth = Math.min(screenWidth - 32, 400);

export default function PackingOrderConfirmScreen({ navigation }: AppNavigation) {
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderDetails, setOrderDetails] = useState<{
        orderNumber: string;
        totalAmount: number;
        installmentAmount: number;
    } | null>(null);

    const { data: cartData } = usePackingCart();
    const createOrderMutation = useCreatePackingOrder();

    const cartItems = cartData?.cart?.items || [];
    const subtotal = cartData?.summary?.subtotal || 0;
    const shippingFee = subtotal > 0 ? 50 : 0;
    const total = subtotal + shippingFee;
    const installmentAmount = Math.ceil(total / 3);

    const handlePlaceOrder = useCallback(async () => {
        try {
            const result = await createOrderMutation.mutateAsync(deliveryNotes || undefined);
            setOrderDetails({
                orderNumber: result.order.orderNumber,
                totalAmount: parseToDecimal(result.order.totalAmount),
                installmentAmount: parseToDecimal(result.installmentPlan.installmentAmount),
            });
            setOrderPlaced(true);
        } catch (error) {
            // Error handled in mutation
        }
    }, [createOrderMutation, deliveryNotes]);

    // Success State
    if (orderPlaced && orderDetails) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('BottomTab')}
                        >
                            <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
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
                                        <Text style={styles.rowValue}>{orderDetails.orderNumber}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.rowLabel}>Total Order Amount</Text>
                                        <Text style={styles.rowValue}>₹{orderDetails.totalAmount.toFixed(0)}</Text>
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
                                        Total amount of <Text style={styles.strongText}>₹{orderDetails.totalAmount.toFixed(0)}</Text> will be cut in{' '}
                                        <Text style={styles.strongText}>3 weekly installments of ₹{orderDetails.installmentAmount.toFixed(0)}</Text>.
                                    </Text>
                                    <Text style={styles.installmentText}>
                                        You will receive a notification each week before deduction.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={[styles.actionButtons, { width: maxWidth }]}>
                            <TouchableOpacity onPress={() => navigation.navigate('PackingOrderHistory')}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.accent]}
                                    style={styles.primaryButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.primaryButtonText}>View Order History</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => navigation.navigate('BottomTab')}
                            >
                                <Text style={styles.secondaryButtonText}>Back to Home</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Confirmation State (before placing order)
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Confirm Order</Text>
                    <View style={styles.emptyRight} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Order Summary Card */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.cardTitle}>Order Summary</Text>
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
                                <Text style={styles.summaryValue}>₹{subtotal.toFixed(0)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Shipping</Text>
                                <Text style={styles.summaryValue}>₹{shippingFee}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryTotalLabel}>Total</Text>
                                <Text style={styles.summaryTotalValue}>₹{total.toFixed(0)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Installment Info Card */}
                    <View style={styles.installmentCard}>
                        <View style={styles.installmentHeader}>
                            <MaterialIcons name="calendar-today" size={24} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>3-Week Installment Plan</Text>
                        </View>
                        <View style={styles.installmentDetails}>
                            <View style={styles.installmentRow}>
                                <View style={styles.weekBadge}>
                                    <Text style={styles.weekBadgeText}>Week 1</Text>
                                </View>
                                <Text style={styles.installmentAmountText}>₹{installmentAmount} - Due Today</Text>
                            </View>
                            <View style={styles.installmentRow}>
                                <View style={[styles.weekBadge, styles.weekBadgePending]}>
                                    <Text style={[styles.weekBadgeText, styles.weekBadgeTextPending]}>Week 2</Text>
                                </View>
                                <Text style={styles.installmentAmountText}>₹{installmentAmount} - In 7 days</Text>
                            </View>
                            <View style={styles.installmentRow}>
                                <View style={[styles.weekBadge, styles.weekBadgePending]}>
                                    <Text style={[styles.weekBadgeText, styles.weekBadgeTextPending]}>Week 3</Text>
                                </View>
                                <Text style={styles.installmentAmountText}>
                                    ₹{(total - 2 * installmentAmount).toFixed(0)} - In 14 days
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Delivery Notes */}
                    <View style={styles.notesCard}>
                        <Text style={styles.cardTitle}>Delivery Notes (Optional)</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add any special instructions..."
                            placeholderTextColor={COLORS.muted}
                            value={deliveryNotes}
                            onChangeText={setDeliveryNotes}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        onPress={handlePlaceOrder}
                        disabled={createOrderMutation.isPending || cartItems.length === 0}
                    >
                        <LinearGradient
                            colors={cartItems.length === 0 ? ['#9CA3AF', '#9CA3AF'] : [COLORS.primary, COLORS.accent]}
                            style={styles.confirmButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {createOrderMutation.isPending ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <View style={styles.confirmContent}>
                                    <Text style={styles.confirmButtonText}>Place Order (₹{total.toFixed(0)})</Text>
                                    <MaterialIcons name="check" size={24} color={COLORS.white} />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    topTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
    },
    emptyCenter: {
        flex: 1,
    },
    emptyRight: {
        width: 48,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 120,
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
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    summaryDetails: {
        gap: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.muted,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    summaryDivider: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginVertical: 8,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    installmentCard: {
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
    installmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    installmentDetails: {
        gap: 12,
    },
    installmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    weekBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    weekBadgePending: {
        backgroundColor: '#F3F4F6',
    },
    weekBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
    },
    weekBadgeTextPending: {
        color: COLORS.muted,
    },
    installmentAmountText: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    notesCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: COLORS.textPrimary,
        minHeight: 80,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    confirmButton: {
        height: 56,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.white,
    },
    // Success state styles
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
        fontSize: 32,
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
        gap: 12,
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
    secondaryButton: {
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
});
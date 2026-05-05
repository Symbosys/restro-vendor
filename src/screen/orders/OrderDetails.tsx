import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Linking,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';
import { useOrderDetails } from '../../api/hooks/order';
import { parseToDecimal } from '../../utils/utils';
import { format } from 'date-fns';
import { AcceptOrderButton, RejectOrderButton, MarkReadyButton } from '../../components/orers/order.action';
import { useAuth } from '../../context/AuthContext';

const OrderDetailsScreen = ({ navigation, route }: AppNavigation) => {
    const { orderId } = route.params || {};
    const { data: order, isLoading, isError, refetch, isFetching } = useOrderDetails({ id: orderId });
    const { vendorId } = useAuth();

    const isRejectedByMe = order?.vendorBroadcasts?.some(
        (b) => String(b.vendorId) === String(vendorId) && b.status === 'REJECTED'
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 }}>
                        Failed to load order details.
                    </Text>
                    <TouchableOpacity style={styles.readyButton} onPress={() => refetch()}>
                        <Text style={styles.readyButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CANCELLED': return '#EF4444';
            case 'DELIVERED': return '#22C55E';
            case 'PREPARING': return '#FB9240';
            case 'READY_FOR_PICKUP': return COLORS.primary;
            default: return '#64748B';
        }
    };

    const handleCall = (phoneNumber: string) => {
        if (!phoneNumber) return;
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleOpenMap = (latitude?: number | null, longitude?: number | null) => {
        if (!latitude || !longitude) {
            Alert.alert('Error', 'Location coordinates not available for this order.');
            return;
        }
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Failed to open map application.');
        });
    };

    const safeFormat = (dateStr: string | null | undefined, formatStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            return format(date, formatStr);
        } catch (e) {
            return '';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top App Bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                style={styles.main} 
                contentContainerStyle={{ paddingBottom: 128 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* Order Summary */}
                <View style={styles.orderSummary}>
                    <Text style={styles.orderNumber}>Order #{order.orderNumber.split('-').pop()}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusChip, { backgroundColor: `${getStatusColor(order.status)}10` }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                {order.status.replace(/_/g, ' ')}
                            </Text>
                        </View>
                        {order.timestamps.estimatedDelivery && (
                            <View style={styles.deliveryChip}>
                                <Text style={styles.deliveryText}>
                                    Delivery by {safeFormat(order.timestamps.estimatedDelivery, 'h:mm a')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Customer Information */}
                <View style={styles.customerSection}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <View style={styles.customerCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="person" size={24} color={COLORS.textSecondary} />
                                </View>
                                <Text style={styles.infoText} numberOfLines={1}>
                                    {order.address?.receiverName || 'Guest User'}
                                </Text>
                            </View>
                            {order.address?.receiverContact && (
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => handleCall(order.address?.receiverContact || '')}
                                >
                                    <Icon name="phone" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="location-on" size={24} color={COLORS.textSecondary} />
                                </View>
                                <Text style={styles.infoText} numberOfLines={2}>
                                    {order.address?.completeAddress || order.address?.mainAddress || 'No address provided'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => handleOpenMap(order.address?.latitude, order.address?.longitude)}
                            >
                                <Icon name="map" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Delivery Partner Information (if assigned) */}
                {order.orderDeliveryAssignment && (
                    <View style={styles.customerSection}>
                        <Text style={styles.sectionTitle}>Delivery Partner</Text>
                        <View style={styles.customerCard}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoLeft}>
                                    <View style={styles.iconContainer}>
                                        <Icon name="delivery-dining" size={24} color={COLORS.textSecondary} />
                                    </View>
                                    <Text style={styles.infoText} numberOfLines={1}>
                                        {order.orderDeliveryAssignment.deliveryPartner?.name || 'Assigned'}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => handleCall(order.orderDeliveryAssignment?.deliveryPartner?.mobile || '')}
                                >
                                    <Icon name="phone" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Ordered Items */}
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionTitle}>Ordered Items</Text>
                    <View style={styles.itemsCard}>
                        <View style={styles.itemsList}>
                            {order.items.map((item, index) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={styles.itemLeft}>
                                        <Text style={styles.quantity}>{item.quantity}x</Text>
                                        <View style={styles.itemDetails}>
                                            <Text style={styles.itemName}>
                                                {item.product.name}
                                                {item.product.weight ? ` (${item.product.weight}g)` : ''}
                                                {item.product.pieces ? ` (${item.product.pieces} pcs)` : ''}
                                            </Text>
                                            {item.notes && <Text style={styles.itemNote}>{item.notes}</Text>}
                                        </View>
                                    </View>
                                    <Text style={styles.itemPrice}>₹{parseToDecimal(item.totalPrice).toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.subtotalDivider} />
                        <View style={styles.pricingList}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Item Total</Text>
                                <Text style={styles.priceValue}>₹{parseToDecimal(order.itemTotal).toFixed(2)}</Text>
                            </View>
                            {parseToDecimal(order.gstOnItemTotal) > 0 && (
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>GST</Text>
                                    <Text style={styles.priceValue}>₹{parseToDecimal(order.gstOnItemTotal).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Delivery Fee</Text>
                                <Text style={styles.priceValue}>₹{parseToDecimal(order.deliveryFee).toFixed(2)}</Text>
                            </View>
                            {parseToDecimal(order.packingFee) > 0 && (
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Packing Fee</Text>
                                    <Text style={styles.priceValue}>₹{parseToDecimal(order.packingFee).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Payable</Text>
                                <Text style={styles.totalValue}>₹{(parseToDecimal(order.paidAmount) || parseToDecimal(order.subtotal)).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* History / Timeline */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Order Timeline</Text>
                    <View style={styles.historyCard}>
                        <View style={styles.paymentRow}>
                            <View style={styles.paymentLeft}>
                                <Icon name="payments" size={24} color={COLORS.textSecondary} />
                                <Text style={styles.paymentText}>{order.paymentMethod}</Text>
                            </View>
                            <View style={[styles.paidBadge, { backgroundColor: order.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 146, 60, 0.1)' }]}>
                                <Text style={[styles.paidText, { color: order.paymentStatus === 'PAID' ? '#22C55E' : '#FB9240' }]}>
                                    {order.paymentStatus}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.timelineDivider} />
                        <View style={styles.timelineList}>
                            {order.tracking?.map((track, index) => (
                                <View key={track.id} style={styles.timelineItem}>
                                    <View style={styles.timelineCircle}>
                                        <Icon name={index === 0 ? "adjust" : "check"} size={16} color={COLORS.primary} />
                                    </View>
                                    {index !== (order.tracking?.length || 0) - 1 && <View style={styles.timelineLine} />}
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.timelineTitle}>{track.eventType.replace(/_/g, ' ')}</Text>
                                        <Text style={styles.timelineTime}>{safeFormat(track.timestamp, 'MMM d, h:mm a')}</Text>
                                        {track.notes && <Text style={styles.itemNote}>{track.notes}</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            {(order.status === 'VENDOR_PENDING' && !isRejectedByMe) && (
                <View style={[styles.actionButtons, { justifyContent: 'center', gap: 24 }]}>
                    <RejectOrderButton orderId={order.id} />
                    <AcceptOrderButton orderId={order.id} />
                </View>
            )}

            {order.status === 'PREPARING' && (
                <View style={[styles.actionButtons, { justifyContent: 'center', gap: 24 }]}>
                    <MarkReadyButton orderId={order.id} />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.2)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
        paddingRight: 40,
    },
    headerSpacer: {
        width: 40,
        height: 40,
    },
    main: {
        flex: 1,
    },
    orderSummary: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
        lineHeight: 21.6,
        letterSpacing: -0.27,
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 9999,
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FB9240',
        marginRight: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FB9240',
        lineHeight: 20,
    },
    deliveryChip: {
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 9999,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deliveryText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    customerSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.textPrimary,
        lineHeight: 28.8,
        letterSpacing: -0.015 * 24,
        marginBottom: 12,
    },
    customerCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        minHeight: 64,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.textPrimary,
        lineHeight: 24,
        flex: 1,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
    },
    itemsSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    itemsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
        overflow: 'hidden',
        padding: 16,
    },
    itemsList: {
        gap: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        gap: 16,
        flex: 1,
    },
    quantity: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginTop: 2,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textPrimary,
        lineHeight: 24,
    },
    itemNote: {
        fontSize: 14,
        color: COLORS.muted,
        lineHeight: 20,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    subtotalDivider: {
        marginVertical: 16,
        height: 1,
        borderStyle: 'dashed',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.2)',
    },
    pricingList: {
        gap: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceLabel: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    priceValue: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    historySection: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    historyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
        overflow: 'hidden',
        padding: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    paidBadge: {
        height: 28,
        paddingHorizontal: 12,
        borderRadius: 9999,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paidText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#22C55E',
    },
    timelineDivider: {
        height: 16,
    },
    timelineList: {
        gap: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    timelineCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${COLORS.primary}10`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineLine: {
        position: 'absolute',
        left: 16,
        top: 32,
        bottom: -16,
        width: 1,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
    },
    timelineContent: {
        flex: 1,
        marginLeft: 8,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textPrimary,
        lineHeight: 24,
    },
    timelineTime: {
        fontSize: 14,
        color: COLORS.muted,
        lineHeight: 20,
    },
    actionButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(148, 163, 184, 0.2)',
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    readyButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
    },
    readyButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
});

export default OrderDetailsScreen;
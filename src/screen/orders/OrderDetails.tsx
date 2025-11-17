import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/color';
import { AppNavigation } from '../../types/types';

const { width: screenWidth } = Dimensions.get('window');

interface OrderDetailsScreenProps { }

const OrderDetailsScreen = ({navigation}:AppNavigation) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Top App Bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("BottomTab")}>
                    <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 128 }}>
                {/* Order Summary */}
                <View style={styles.orderSummary}>
                    <Text style={styles.orderNumber}>Order #A4B2-C8D9</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusChip}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Preparing</Text>
                        </View>
                        <View style={styles.deliveryChip}>
                            <Text style={styles.deliveryText}>Delivery by 7:30 PM</Text>
                        </View>
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
                                <Text style={styles.infoText} numberOfLines={1}>Jordan Smith</Text>
                            </View>
                            <TouchableOpacity style={styles.actionButton}>
                                <Icon name="phone" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="location-on" size={24} color={COLORS.textSecondary} />
                                </View>
                                <Text style={styles.infoText} numberOfLines={1}>123 Market St, Suite 400</Text>
                            </View>
                            <TouchableOpacity style={styles.actionButton}>
                                <Icon name="map" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Ordered Items */}
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionTitle}>Ordered Items</Text>
                    <View style={styles.itemsCard}>
                        <View style={styles.itemsList}>
                            <View style={styles.itemRow}>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.quantity}>1x</Text>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>Spicy Tuna Roll</Text>
                                        <Text style={styles.itemNote}>Extra wasabi</Text>
                                    </View>
                                </View>
                                <Text style={styles.itemPrice}>$12.50</Text>
                            </View>
                            <View style={styles.itemRow}>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.quantity}>2x</Text>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>Miso Soup</Text>
                                    </View>
                                </View>
                                <Text style={styles.itemPrice}>$7.00</Text>
                            </View>
                            <View style={styles.itemRow}>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.quantity}>1x</Text>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>Green Tea</Text>
                                    </View>
                                </View>
                                <Text style={styles.itemPrice}>$3.00</Text>
                            </View>
                        </View>
                        <View style={styles.subtotalDivider} />
                        <View style={styles.pricingList}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Subtotal</Text>
                                <Text style={styles.priceValue}>$22.50</Text>
                            </View>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Taxes</Text>
                                <Text style={styles.priceValue}>$1.97</Text>
                            </View>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Delivery Fee</Text>
                                <Text style={styles.priceValue}>$5.00</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>$29.47</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* History */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>History</Text>
                    <View style={styles.historyCard}>
                        <View style={styles.paymentRow}>
                            <View style={styles.paymentLeft}>
                                <Icon name="credit-card" size={24} color={COLORS.textSecondary} />
                                <Text style={styles.paymentText}>Credit Card</Text>
                            </View>
                            <View style={styles.paidBadge}>
                                <Text style={styles.paidText}>Paid</Text>
                            </View>
                        </View>
                        <View style={styles.timelineDivider} />
                        <View style={styles.timelineList}>
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineCircle}>
                                    <Icon name="check" size={16} color={COLORS.primary} />
                                </View>
                                <View style={styles.timelineLine} />
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>Out for Delivery</Text>
                                    <Text style={styles.timelineTime}>7:05 PM</Text>
                                </View>
                            </View>
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineCircle}>
                                    <Icon name="check" size={16} color={COLORS.primary} />
                                </View>
                                <View style={styles.timelineLine} />
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>Preparing</Text>
                                    <Text style={styles.timelineTime}>6:45 PM</Text>
                                </View>
                            </View>
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineCircle}>
                                    <Icon name="check" size={16} color={COLORS.primary} />
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineTitle}>Order Placed</Text>
                                    <Text style={styles.timelineTime}>6:40 PM</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.readyButton}>
                    <Text style={styles.readyButtonText}>Mark as Ready</Text>
                </TouchableOpacity>
            </View>
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
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
    StyleSheet,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import { VendorBroadcastItem, OrderStatus, BroadcastStatus } from '../../../../types/order.types';
import { COLORS } from '../../../../theme/color';
import { parseToDecimal, getVendorOrderTotal, CalculateDistance } from '../../../../utils/utils';
import { useVendorById } from '../../../../hooks/useVendorQueries';
import { AcceptOrderButton, RejectOrderButton, MarkReadyButton } from '../../../../components/orers/order.action';

const { height } = Dimensions.get('window');

interface OrderModalProps {
    orders: VendorBroadcastItem[];
    visible: boolean;
    onClose: () => void;
}



const OrderDetailModal: React.FC<OrderModalProps> = ({ orders, visible, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: vendor } = useVendorById();

    useEffect(() => {
        if (visible) setCurrentIndex(0);
    }, [visible, orders.length]);

    const broadcast = orders[currentIndex];
    const order = broadcast?.order;

    const addressCoords = order?.address
        ? { latitude: order.address.latitude, longitude: order.address.longitude }
        : null;
    const vendorCoords = vendor
        ? { latitude: vendor.latitude, longitude: vendor.longitude }
        : null;
    const distance = (vendorCoords && addressCoords)
        ? CalculateDistance(vendorCoords, addressCoords)
        : undefined;

    const theme = useMemo(() => {
        if (!order) return { colors: ['#6366f1', '#4f46e5'], label: 'ORDER', secondary: '#eef2ff' };
        switch (order.status) {
            case OrderStatus.VENDOR_PENDING:
                return { colors: ['#10b981', '#059669'], label: 'NEW REQUEST', secondary: '#ecfdf5' };
            case OrderStatus.PREPARING:
                return { colors: ['#f59e0b', '#d97706'], label: 'PREPARING', secondary: '#fffbeb' };
            case OrderStatus.READY_FOR_PICKUP:
                return { colors: [COLORS.primary, COLORS.primaryDark], label: 'READY', secondary: COLORS.primaryLight };
            default:
                return { colors: ['#64748b', '#475569'], label: 'ORDER', secondary: '#f8fafc' };
        }
    }, [order?.status]);

    if (!visible || !order) return null;

    const handleNext = () => currentIndex < orders.length - 1 && setCurrentIndex(currentIndex + 1);
    const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Compact Premium Header */}
                    <LinearGradient colors={theme.colors} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.header}>
                        <View style={styles.dragHandle} />
                        
                        <View style={styles.headerMain}>
                            <View style={styles.orderIdent}>
                                <Text style={styles.orderLabel}>{theme.label}</Text>
                                <Text style={styles.orderId}>#{order.orderNumber.split('-').pop()}</Text>
                            </View>

                            <View style={styles.headerRight}>
                                {orders.length > 1 && (
                                    <View style={styles.navPill}>
                                        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
                                            <Icon name="chevron-left" size={20} color={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "#fff"} />
                                        </TouchableOpacity>
                                        <Text style={styles.navText}>{currentIndex + 1}/{orders.length}</Text>
                                        <TouchableOpacity onPress={handleNext} disabled={currentIndex === orders.length - 1}>
                                            <Icon name="chevron-right" size={20} color={currentIndex === orders.length - 1 ? "rgba(255,255,255,0.3)" : "#fff"} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Icon name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={styles.headerMeta}>
                            <View style={styles.metaItem}>
                                <Icon name="schedule" size={12} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.metaText}>{formatDistanceToNow(new Date(order.timestamps?.placedAt || new Date()), { addSuffix: true })}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Icon name="payments" size={12} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.metaText}>{order.paymentMethod}</Text>
                            </View>
                            {distance !== undefined && distance > 0 ? (
                                <View style={styles.metaItem}>
                                    <Icon name="location-on" size={12} color="rgba(255,255,255,0.9)" />
                                    <Text style={styles.metaText}>{distance.toFixed(2)} km</Text>
                                </View>
                            ) : null}
                        </View>
                    </LinearGradient>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
                        {/* Summary Bar */}
                        <View style={styles.summaryBar}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>ITEMS</Text>
                                <Text style={styles.summaryValue}>{order.items.length}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>TOTAL EARNINGS</Text>
                                <Text style={styles.summaryValue}>₹{getVendorOrderTotal(order).toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Minimalist Items List */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Items</Text>
                             {order.items.map((item, idx) => {
                                 const itemVendorPrice = parseToDecimal(item.product?.vendorPrice) || parseToDecimal(item.unitPrice);
                                 return (
                                     <View key={item.id} style={[styles.itemRow, idx === order.items.length - 1 && { borderBottomWidth: 0 }]}>
                                         <View style={styles.itemQtyBadge}>
                                             <Text style={styles.itemQtyText}>{item.quantity} X</Text>
                                         </View>
                                         <View style={styles.itemDetails}>
                                             <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                                             <Text style={styles.itemPriceDetail}>
                                                 ₹{itemVendorPrice.toFixed(2)}
                                                 {item.product.weight ? ` • ${item.product.weight}` : ''}
                                                 {item.product.pieces ? ` • ${item.product.pieces} pcs` : ''}
                                             </Text>
                                         </View>
                                         <Text style={styles.itemTotal}>₹{(itemVendorPrice * Number(item.quantity || 0)).toFixed(2)}</Text>
                                     </View>
                                 );
                             })}
                        </View>

                        {/* Compact Bill Card */}
                        <View style={styles.billCard}>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Item Total</Text>
                                <Text style={styles.billValue}>₹{getVendorOrderTotal(order).toFixed(2)}</Text>
                            </View>
                            <View style={styles.grandTotalRow}>
                                <Text style={styles.grandTotalLabel}>Total Earnings</Text>
                                <Text style={[styles.grandTotalValue, { color: theme.colors[0] }]}>
                                    ₹{getVendorOrderTotal(order).toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Optimized Footer Action Bar */}
                    <View style={styles.footer}>
                        {(broadcast.status === BroadcastStatus.PENDING || order.status === OrderStatus.PREPARING) && (
                            <View style={styles.actionWrapper}>
                                {broadcast.status === BroadcastStatus.PENDING ? (
                                    <>
                                        <View style={styles.rejectContainer}>
                                            <RejectOrderButton orderId={order.id} />
                                        </View>
                                        <View style={styles.acceptContainer}>
                                            <AcceptOrderButton orderId={order.id} />
                                        </View>
                                    </>
                                ) : (
                                    <View style={styles.fullActionContainer}>
                                        <MarkReadyButton orderId={order.id} />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: height * 0.85,
        overflow: 'hidden',
    },
    header: {
        paddingTop: 8,
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
    dragHandle: {
        width: 32,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    headerMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderIdent: {
        gap: 2,
    },
    orderLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    orderId: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    navPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 8,
    },
    navText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerMeta: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 14,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    body: {
        flex: 1,
    },
    summaryBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        marginHorizontal: 24,
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    summaryDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#e2e8f0',
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    itemQtyBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    itemQtyText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#475569',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    itemPriceDetail: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
        marginTop: 1,
    },
    itemTotal: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
    },
    billCard: {
        marginHorizontal: 24,
        marginTop: 24,
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    billLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    billValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    grandTotalValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    actionWrapper: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectContainer: {
        // Removed flex to allow centering
    },
    acceptContainer: {
        // Removed flex to allow centering
    },
    fullActionContainer: {
        // Removed flex to allow centering
    }
});

export default OrderDetailModal;

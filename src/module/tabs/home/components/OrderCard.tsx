import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VendorBroadcastItem, OrderStatus, BroadcastStatus } from '../../../../types/order.types';
import { COLORS } from '../../../../theme/color';
import { styles } from '../styles/homeStyles';
import { parseToDecimal } from '../../../../utils/utils';

interface OrderCardProps {
    item: VendorBroadcastItem;
    onPress: (item: VendorBroadcastItem) => void;
    onAction?: (action: 'accept' | 'reject' | 'markReady', orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ item: broadcast, onPress, onAction }) => {
    const { order } = broadcast;
    const isPending = broadcast.status === BroadcastStatus.PENDING;
    const itemsPreview = order.items.slice(0, 2);
    const moreItems = order.items.length > 2 ? `+${order.items.length - 2}` : '';

    const getStatusTheme = useCallback((broadcastStatus: BroadcastStatus, orderStatus: OrderStatus) => {
        if (broadcastStatus === BroadcastStatus.MISSED) {
            return { color: '#ef4444', bgColor: '#fef2f2', label: 'Missed' };
        }
        if (broadcastStatus === BroadcastStatus.REJECTED) {
            return { color: '#ef4444', bgColor: '#fef2f2', label: 'Rejected' };
        }
        if (broadcastStatus === BroadcastStatus.PENDING) {
            return { color: '#10b981', bgColor: '#ecfdf5', label: 'New' };
        }

        // For ACCEPTED broadcast, use order status
        switch (orderStatus) {
            case OrderStatus.PREPARING:
                return { color: '#f59e0b', bgColor: '#fffbeb', label: 'Preparing' };
            case OrderStatus.READY_FOR_PICKUP:
                return { color: COLORS.primary, bgColor: '#f5eeff', label: 'Ready' };
            case OrderStatus.DELIVERED:
                return { color: '#64748b', bgColor: '#f1f5f9', label: 'Delivered' };
            default:
                return { color: COLORS.primary, bgColor: '#f5eeff', label: 'Accepted' };
        }
    }, []);

    const theme = getStatusTheme(broadcast.status, order.status);

    return (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => onPress(broadcast)}
            activeOpacity={0.8}
        >
            {/* Header: Order ID and Status */}
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <View style={styles.orderIdBadge}>
                        <Text style={styles.orderIdText}>#{order.orderNumber.split('-').pop()}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Icon name="access-time" size={14} color={THEME.textDim} />
                        <Text style={styles.timeText}>
                            {new Date(broadcast.notifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: theme.bgColor + 'CC' }]}>
                    <View style={[styles.pulsingDot, { backgroundColor: theme.color }]} />
                    <Text style={[styles.statusBadgeText, { color: theme.color }]}>{theme.label}</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Items Preview */}
            <View style={styles.itemsGrid}>
                {itemsPreview.map((item) => (
                    <View key={item.id} style={styles.itemPreview}>
                        <View style={styles.itemThumb}>
                            <Icon name="restaurant" size={18} color={THEME.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemNameLabel} numberOfLines={1}>{item.product.name}</Text>
                            <Text style={styles.itemQtyLabel}>Quantity: {item.quantity}</Text>
                        </View>
                        {/* <Text style={styles.itemPriceLabel}>₹{parseToDecimal(item.totalPrice).toFixed(0)}</Text> */}
                    </View>
                ))}
                {moreItems && (
                    <View style={styles.moreItemsRow}>
                        <View style={styles.moreItemsBadge}>
                            <Text style={styles.moreItemsText}>{moreItems} more items</Text>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabelSmall}>Payable Amount</Text>
                    <Text style={styles.totalValueLarge}>₹{parseToDecimal(order.subtotal).toFixed(0)}</Text>
                </View>

                {broadcast.status === BroadcastStatus.PENDING ? (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => onAction?.('reject', order.id)}
                        >
                            <Text style={styles.actionBtnText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => onAction?.('accept', order.id)}
                        >
                            <Text style={styles.actionBtnText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.detailsBtn}>
                        <Text style={styles.detailsBtnText}>View Details</Text>
                        <Icon name="arrow-forward" size={16} color="#fff" />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const THEME = {
    primary: '#8719C6',
    textMain: '#1e293b',
    textDim: '#64748b',
};

export default OrderCard;

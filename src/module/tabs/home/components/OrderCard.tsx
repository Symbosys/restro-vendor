import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VendorBroadcastItem, OrderStatus, BroadcastStatus } from '../../../../types/order.types';
import { COLORS } from '../../../../theme/color';
import { styles } from '../styles/homeStyles';

interface OrderCardProps {
    item: VendorBroadcastItem;
    onPress: (item: VendorBroadcastItem) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ item: broadcast, onPress }) => {
    const { order } = broadcast;
    const isPending = broadcast.status === BroadcastStatus.PENDING;
    const itemsPreview = order.items.slice(0, 2);
    const moreItems = order.items.length > 2 ? `+${order.items.length - 2}` : '';

    const getStatusTheme = useCallback((status: OrderStatus | BroadcastStatus) => {
        switch (status) {
            case OrderStatus.VENDOR_PENDING:
            case BroadcastStatus.PENDING:
                return { color: '#10b981', bgColor: '#ecfdf5', label: 'New' };
            case OrderStatus.PREPARING:
                return { color: '#f59e0b', bgColor: '#fffbeb', label: 'Preparing' };
            case OrderStatus.READY_FOR_PICKUP:
                return { color: COLORS.primary, bgColor: '#f5eeff', label: 'Ready' };
            case OrderStatus.DELIVERED:
                return { color: '#64748b', bgColor: '#f1f5f9', label: 'Delivered' };
            default:
                return { color: '#64748b', bgColor: '#f1f5f9', label: 'Pending' };
        }
    }, []);

    const theme = getStatusTheme(order.status);

    return (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => onPress(broadcast)}
            activeOpacity={0.9}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <View style={styles.orderIdBadge}>
                        <Text style={styles.orderIdText}>#{order.orderNumber}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>
                        {order.items.length} Items • 2.1 km
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: theme.bgColor }]}>
                    <Text style={[styles.statusBadgeText, { color: theme.color }]}>{theme.label}</Text>
                </View>
            </View>

            <View style={styles.itemsGrid}>
                {itemsPreview.map((item) => (
                    <View key={item.id} style={styles.itemPreview}>
                        <View style={styles.itemThumb}>
                            <Icon name="restaurant" size={20} color="#94a3b8" />
                        </View>
                        <Text style={styles.itemNameLabel} numberOfLines={1}>{item.product.name}</Text>
                        <Text style={styles.itemQtyLabel}>x{item.quantity}</Text>
                    </View>
                ))}
                {moreItems && (
                    <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: '700', marginLeft: 52 }}>
                        {moreItems} more items...
                    </Text>
                )}
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabelSmall}>Total Price</Text>
                    <Text style={styles.totalValueLarge}>₹{order.subtotal.toFixed(0)}</Text>
                </View>
                <View
                    style={styles.detailsBtn}
                >
                    <Text style={styles.detailsBtnText}>Details</Text>
                    <Icon name="chevron-right" size={20} color="#fff" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default OrderCard;
